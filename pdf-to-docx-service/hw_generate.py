import gc
import glob
import json
import os
import re

from hw_parser import parse
from hw_renderer import render_pages, pages_to_pdf_bytes, DPI, normalize_glyph_sheet
from hw_paper import make_paper, composite, camera_effect

MAX_CHARS = 6000
BLACK = (26, 26, 38)


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


def generate_pdf(text, glyphs, tone="photo", style="plain", photo_effect=True,
                 pen_boost=1.1, slant_deg=0, clean_dots=False, black_leadins=True, seed=1):
    parsed = parse(text)
    if black_leadins:
        parsed = blacken_leadins(parsed)
    pages, info = render_pages(
        glyphs, parsed, seed=seed,
        cfg={"ruled": style == "ruled", "pen_boost": pen_boost, "black": BLACK,
             "slant_deg": slant_deg, "clean_dots": clean_dots},
    )
    final = []
    for i, flat in enumerate(pages):
        paper = make_paper(
            flat.width, flat.height, style=style, tone=tone, seed=10 + i, dpi=DPI,
            ruled={"line_height": info["line_height"], "base0": info["base0"],
                   "margin_x": info["margin_left"] - 4 * (DPI / 25.4)},
        )
        img = composite(flat, paper, seed=20 + i)
        if photo_effect:
            img = camera_effect(img, seed=30 + i)
        final.append(img)
    pdf = pages_to_pdf_bytes(final)
    del pages, final
    gc.collect()
    return pdf, info