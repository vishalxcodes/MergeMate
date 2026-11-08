import gc
import glob
import io
import json
import os
import re
import threading

from PIL import Image

from hw_parser import parse
from hw_renderer import render_pages, pages_to_pdf_bytes, DPI, normalize_glyph_sheet, DEFAULT_CFG, PageLimitError
from hw_paper import make_paper, composite, camera_effect
from hw_settings import settings_to_cfg

try:
    import fitz  # PyMuPDF (app.py already needs it)
except Exception:  # pragma: no cover
    fitz = None

# Keep these three in sync: MAX_CHARS here, MAX_TEXT in server/routes/handwriting.js, and the "/ N" counter in the controller.
# About 1000 characters = 1 page.  Start with 10000 on the free Render instance; raise to 20000 only after a 20-page live test
# finishes well inside Node's 120 s timeout.
MAX_CHARS = 10000
MAX_PAGES = 30               # hard limit per PDF; more than this -> user generates in parts and merges
PREVIEW_CHARS = 900          # preview = only the beginning of the text (about one page), so sliders feel quick
BLACK = (26, 26, 38)

TOO_MANY_PAGES_MSG = ("This text makes more than %d pages. Generate it in parts "
                      "and join the PDFs with our Merge PDF tool." % MAX_PAGES)


class TooManyPages(ValueError):
    """Raised when the text needs more than MAX_PAGES pages (ValueError so existing error handling still catches it)."""


def blacken_leadins(parsed, max_len=45):
    # test_render.py wali same logic: "- Grouping similar data:" black pen mein
    for ln in parsed["lines"]:
        flat = [(ch, col) for text, col in (ln.get("spans") or []) for ch in text]
        text = "".join(ch for ch, _ in flat)
        m = re.match(r"^\s*[\u2022\-]\s*([^:]{1,%d}:)" % max_len, text)
        if not m:
            continue
        for i in range(m.start(1), m.end(1)):
            ch, col = flat[i]
            suffix = col.partition(":")[2]
            flat[i] = (ch, "black:" + suffix if suffix else "black")
        spans = []
        for ch, col in flat:
            if spans and spans[-1][1] == col:
                spans[-1] = (spans[-1][0] + ch, col)
            else:
                spans.append((ch, col))
        ln["spans"] = spans
    return parsed


def glyphs_from_request(raw):
    """Frontend se aaya {char: base64 ya [base64, ...]} -> renderer ka {char: [b64, ...]}"""
    if not isinstance(raw, dict) or not raw:
        return None
    lists = {}
    for ch, v in raw.items():
        items = v if isinstance(v, list) else [v]
        items = [s.split(",", 1)[1] if isinstance(s, str) and s.startswith("data:") else s
                 for s in items if isinstance(s, str) and s]
        if items:
            lists[ch] = items
    if not lists:
        return None
    glyphs = {}
    for i in range(max(len(v) for v in lists.values())):
        sheet = normalize_glyph_sheet({ch: v[i] for ch, v in lists.items() if len(v) > i})
        for ch, b64 in sheet.items():
            glyphs.setdefault(ch, []).append(b64)
    return glyphs


def load_dev_glyphs(folder="."):
    """Dev fallback: folder ki seg*.json + bad_samples.json (test_render.py jaisa)"""
    bad = {}
    bp = os.path.join(folder, "bad_samples.json")
    if os.path.exists(bp):
        bad = json.load(open(bp, encoding="utf-8"))
    pool = {}
    for fpath in sorted(glob.glob(os.path.join(folder, "seg*.json"))):
        name = os.path.basename(fpath)
        sheet = normalize_glyph_sheet(json.load(open(fpath, encoding="utf-8"))["glyphs"])
        for a, b in bad.get("_swap", {}).get(name, []):
            if a in sheet and b in sheet:
                sheet[a], sheet[b] = sheet[b], sheet[a]
        for ch, b64 in sheet.items():
            pool.setdefault(ch, []).append((name, b64))
    glyphs = {}
    for ch, items in pool.items():
        keep = [(f, b) for f, b in items if f not in bad.get(ch, [])] or items
        glyphs[ch] = [b for _, b in keep]
    if not glyphs:
        raise ValueError("No glyphs: request mein glyphs bhejo ya folder mein seg*.json rakho")
    return glyphs


def _first_page_jpeg(img, max_w=1000):
    """Preview = first page as a small JPEG (shows on every phone, unlike a PDF inside the page).  None if the page
    object cannot be converted - the caller then falls back to the normal PDF."""
    try:
        im = img.convert("RGB")
        if im.width > max_w:
            im = im.resize((max_w, round(im.height * max_w / im.width)))
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=82)
        return buf.getvalue()
    except Exception:
        return None


# One render at a time: two renders at once is what runs the 512 MB instance out of memory.
_GEN_LOCK = threading.Lock()


def _to_jpeg_bytes(img, quality=88):
    im = img if getattr(img, "mode", None) == "RGB" else img.convert("RGB")
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=quality, dpi=(DPI, DPI))
    return buf.getvalue()


def _pdf_from_jpegs(jpegs):
    """A4 pages from already compressed page images - the raw pictures are not needed any more."""
    doc = fitz.open()
    try:
        for jb in jpegs:
            w, h = Image.open(io.BytesIO(jb)).size           # reads the header only
            page = doc.new_page(width=w * 72.0 / DPI, height=h * 72.0 / DPI)
            page.insert_image(page.rect, stream=jb)
        return doc.tobytes(deflate=True)
    finally:
        doc.close()


def _rss_mb():
    """Memory this process uses right now (Linux); None elsewhere."""
    try:
        for line in open("/proc/self/status"):
            if line.startswith("VmRSS"):
                return int(line.split()[1]) / 1024.0
    except Exception:
        pass
    return None


def _log_peak(n_chars, n_pages):
    """Peak and current memory in the logs: use it to choose MAX_CHARS."""
    try:
        import resource
        peak = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024.0
        now = _rss_mb()
        print(f"[hw] chars={n_chars} pages={n_pages} peak_rss_mb={peak:.0f} now_rss_mb={now or 0:.0f}", flush=True)
    except Exception:
        pass


_start = _rss_mb()
if _start:
    print(f"[hw] module loaded, rss_mb={_start:.0f}", flush=True)     # what the service already uses before any request


def generate_pdf(text, glyphs, tone="photo", style="plain", photo_effect=True,
                 pen_boost=1.1, slant_deg=0, clean_dots=False, black_leadins=True, seed=1,
                 settings=None, preview_image=False):
    """settings: output of hw_settings.clean_settings() - only the keys the user changed.
    Without it the cfg below is exactly what it was before, so existing callers render the same page.
    preview_image=True: return the first page as a JPEG (info["mime"] == "image/jpeg") instead of the PDF.
    Raises TooManyPages (a ValueError) when the text needs more than MAX_PAGES pages."""
    with _GEN_LOCK:
        return _generate_pdf(text, glyphs, tone, style, photo_effect, pen_boost, slant_deg, clean_dots,
                             black_leadins, seed, settings, preview_image)


def _generate_pdf(text, glyphs, tone, style, photo_effect, pen_boost, slant_deg, clean_dots,
                  black_leadins, seed, settings, preview_image):
    parsed = parse(text)
    if black_leadins:
        parsed = blacken_leadins(parsed)
    cfg = {"ruled": style == "ruled", "pen_boost": pen_boost, "black": BLACK,
           "slant_deg": slant_deg, "clean_dots": clean_dots}
    if settings:
        cfg.update(settings_to_cfg(settings, DEFAULT_CFG["x_height"]))

    # Every page is finished (paper -> ink -> camera -> JPEG) the moment the renderer completes it, and the big
    # white page image is freed straight away.  So memory no longer grows with the number of pages.
    keep = []                                   # JPEG bytes (fitz available) or raw images (fallback)
    state = {"i": 0, "preview": preview_image, "preview_data": None}

    def on_page(flat, meta):
        i = state["i"]
        state["i"] += 1
        if state["preview"] and i > 0:          # the preview shows page 1 only: do not finish the rest
            return
        paper = make_paper(
            flat.width, flat.height, style=style, tone=tone, seed=10 + i, dpi=DPI,
            ruled={"line_height": meta["line_height"], "base0": meta["base0"],
                   "margin_x": meta["margin_left"] - 4 * (DPI / 25.4)},
        )
        img = composite(flat, paper, seed=20 + i)
        del paper
        if photo_effect:
            img = camera_effect(img, seed=30 + i)
        if state["preview"]:
            data = _first_page_jpeg(img)
            if data is not None:
                state["preview_data"] = data
                return
            state["preview"] = False            # could not make the JPEG: fall back to the normal PDF
        keep.append(_to_jpeg_bytes(img) if fitz else img)
        del img
        gc.collect()

    try:
        pages, info = render_pages(glyphs, parsed, seed=seed, cfg=cfg, on_page=on_page, max_pages=MAX_PAGES)
    except PageLimitError:
        keep.clear()
        gc.collect()
        raise TooManyPages(TOO_MANY_PAGES_MSG)
    del pages
    n_pages = info["page_count"]

    if state["preview_data"] is not None:
        info = dict(info)
        info["mime"] = "image/jpeg"
        _log_peak(len(text), n_pages)
        return state["preview_data"], info

    pdf = _pdf_from_jpegs(keep) if fitz else pages_to_pdf_bytes(keep)
    info = dict(info)
    info["mime"] = "application/pdf"
    del keep
    gc.collect()
    _log_peak(len(text), n_pages)
    return pdf, info