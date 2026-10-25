"""
hw_renderer.py - composes the user's own handwriting glyphs onto A4 pages.

Input : glyphs {char: base64 PNG}, parsed text from hw_parser.parse()
Output: list of PIL pages (+ helper to turn them into one PDF)

Look-and-feel knobs live in DEFAULT_CFG. Everything is in pixels at DPI (use MM for millimetres).

CHANGES in this version
  1) render_pages now PLANS every word first (sample, size, rotation, gaps are decided once) and wraps lines using
     those exact widths -> text can no longer run past the right margin.
  2) normalize_glyph_sheet also fixes capitals that were written too small (e.g. V that looks like v).
"""
import base64
import io
import math
import random
import re
import os
import cv2
import numpy as np
from PIL import Image, ImageDraw

DPI = int(os.environ.get("HW_DPI", "200"))
MM = DPI / 25.4

DEFAULT_CFG = {
    "dpi": DPI,
    "page_w": round(210 * MM),
    "page_h": round(297 * MM),
    "margin_left": 7 * MM,
    "margin_right": 6 * MM,
    "margin_top": 10 * MM,
    "margin_bottom": 12 * MM,
    "x_height": 3.15 * MM,      # target height of small letters on the page (smaller = lighter-looking page)
    "line_height": 12 * MM,     # average distance between lines (your page: ~12.5 mm)
    "indent": 7 * MM,
    "black": (14, 14, 22),
    "blue": (14, 36, 145),      # clear blue (headings stay black)
    "letter_gap": 0.16,         # space between letters, fraction of x_height (smaller = tighter)
    "word_gap": 1.0,            # space between words, fraction of x_height
    "connect": True,            # small joining strokes between neighbouring lowercase letters
    "ruled": False,             # True: spacing is exact so text sits on ruled-paper lines
    "pen_boost": 1.7,           # pen thickness vs. the thin calibration glyphs (1 = leave as is)
    "pen_max_mm": 0.80,         # never thicker than this
    "line_jitter": 0.12,        # every line gap varies by +/- this fraction
    "word_jitter": 0.10,        # every word floats up/down by up to this much (x_height)
    "wave": 0.10,               # slow up/down drift along a line (x_height)
    "slope": 0.008,             # each line tilts a little
    "title_x": 0.42,            # where the right part of a "left || right" line starts (fraction of width)
    "right_safety": 0.5,        # NEW: keep this much (x_height) free before the right margin (underline/rotation slack)
    "clean_dots": False,        # NEW: redraw the full stop (and so ':' and the bullet) as a clean round dot instead of the ragged scanned one
    "slant_deg": 0.0,           # NEW: lean every letter to the right by this angle (running handwriting leans; calibration letters are upright). Try 8-12
}

X_HEIGHT_CHARS = "acemnorsuvwxz"
CAP_CHARS = "BDEFHKLMNPRTUVWXYZ"
LOWER = set("abcdefghijklmnopqrstuvwxyz")
# fraction of the glyph's own height that hangs below the baseline
DESCEND = {"f": 0.45, "g": 0.36, "j": 0.30, "p": 0.36, "q": 0.36, "y": 0.36, ",": 0.5}
_ELL3 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))


def _decode_mask(b64):
    """base64 PNG -> 'L' ink mask (255 = ink), cropped tight, polarity-safe."""
    im = Image.open(io.BytesIO(base64.b64decode(b64)))
    ink = None
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        alpha = np.array(im.convert("RGBA"))[:, :, 3]
        if alpha.min() < 250:
            ink = alpha
    if ink is None:
        g = np.array(im.convert("L"))
        ink = 255 - g if (g > 127).mean() > 0.5 else g  # ink = minority colour
    ink = np.where(ink < 40, 0, ink).astype(np.uint8)
    ys, xs = np.where(ink > 0)
    if len(xs) == 0:
        return None
    return Image.fromarray(ink[ys.min():ys.max() + 1, xs.min():xs.max() + 1])


def normalize_glyph_sheet(glyphs_b64, target_xh=40, min_cap_ratio=0.9):
    """Rescale every glyph of ONE calibration sheet so its small letters are `target_xh` px tall.
    Sheets made from photos of different size / distance / pipeline version would otherwise give
    letters of different sizes when several sheets are mixed as samples of the same letter.

    NEW: capitals (CAP_CHARS) that came out clearly shorter than the sheet's median capital
    (height < min_cap_ratio * median) are scaled up to the median capital height - this fixes a
    'V' that was written small and looks like a lowercase 'v' on the page."""
    masks = {}
    for ch, b64 in glyphs_b64.items():
        try:
            m = _decode_mask(b64)
        except Exception:
            m = None
        if m is not None:
            masks[ch] = m
    hs = [masks[c].height for c in X_HEIGHT_CHARS if c in masks]
    if not hs:
        return glyphs_b64
    k = target_xh / float(np.median(hs))
    scaled = {ch: m.resize((max(1, round(m.width * k)), max(1, round(m.height * k))), Image.LANCZOS)
              for ch, m in masks.items()}

    cap_hs = [scaled[c].height for c in CAP_CHARS if c in scaled]
    if len(cap_hs) >= 3:
        cap_med = float(np.median(cap_hs))
        for ch in CAP_CHARS:
            m = scaled.get(ch)
            if m is not None and m.height < min_cap_ratio * cap_med:
                f = cap_med / m.height
                scaled[ch] = m.resize((max(1, round(m.width * f)), max(1, round(cap_med))), Image.LANCZOS)

    out = {}
    for ch, im in scaled.items():
        buf = io.BytesIO()
        im.save(buf, "PNG")
        out[ch] = base64.b64encode(buf.getvalue()).decode()
    return out


def _stroke_width(masks):
    """Typical pen thickness in px: for thin pen strokes w is roughly 2.2x the mean distance-to-edge."""
    vals = []
    for m in masks:
        a = (np.array(m) > 127).astype(np.uint8)
        if a.sum() < 20:
            continue
        a = np.pad(a, 2)
        dt = cv2.distanceTransform(a, cv2.DIST_L2, 3)
        vals.append(2.2 * float(dt[a > 0].mean()))
    return max(1.5, float(np.median(vals))) if vals else 2.0


def _thicken(m, grow):
    """Make every pen stroke `grow` px thicker on each side (fractions allowed)."""
    if grow <= 0.05:
        return m
    n = int(grow)
    frac = grow - n
    pad = n + 2
    cur = np.pad(np.array(m, np.uint8), pad)
    for _ in range(n):
        cur = cv2.dilate(cur, _ELL3)
    res = cur.astype(np.float32)
    if frac > 0.05:
        res = res + frac * (cv2.dilate(cur, _ELL3).astype(np.float32) - res)
    res = np.clip(res, 0, 255).astype(np.uint8)
    ys, xs = np.where(res > 0)
    return Image.fromarray(res[ys.min():ys.max() + 1, xs.min():xs.max() + 1])


def _clean_dot(m, xh):
    """Scanned full stops are often ragged / squarish.  Redraw as a smooth filled ellipse of the same size
    (only for small marks, so a comma or anything bigger is never touched)."""
    w, h = m.size
    if max(w, h) > 0.6 * xh:
        return m
    S = 4
    big = Image.new("L", (w * S, h * S), 0)
    ImageDraw.Draw(big).ellipse((0, 0, w * S - 1, h * S - 1), fill=255)
    return big.resize((w, h), Image.LANCZOS)


def _prepare(glyphs_b64, cfg):
    """glyphs_b64[char] is one base64 PNG, or a LIST of them (several samples of the same letter)."""
    raw, raw_more = {}, {}
    for ch, val in glyphs_b64.items():
        if not isinstance(ch, str) or len(ch) != 1:
            continue
        items = val if isinstance(val, (list, tuple)) else [val]
        masks = []
        for b64 in items:
            try:
                m = _decode_mask(b64)
            except Exception:
                m = None
            if m is not None:
                masks.append(m)
        if masks:
            raw[ch] = masks[0]
            if len(masks) > 1:
                raw_more[ch] = masks

    heights = [raw[c].height for c in X_HEIGHT_CHARS if c in raw]
    if not heights:
        raise ValueError("Not enough glyphs to render")
    median_raw = float(np.median(heights))

    def build(scale):
        return {ch: m.resize((max(1, round(m.width * scale)), max(1, round(m.height * scale))), Image.LANCZOS)
                for ch, m in raw.items()}

    def xh_masks(d):
        return [d[c] for c in X_HEIGHT_CHARS if c in d]

    # 1) how thin is the pen in the calibration glyphs, and how thick should it be on the page?
    s0 = build(cfg["x_height"] / median_raw)
    w0 = _stroke_width(xh_masks(s0))
    target = min(w0 * cfg["pen_boost"], cfg["pen_max_mm"] * cfg["dpi"] / 25.4)
    grow = max(0.0, (target - w0) / 2)

    # 2) rescale so that the letters are still x_height tall AFTER thickening
    scaled = build(max(4.0, cfg["x_height"] - 2 * grow) / median_raw)
    grow = max(0.0, (target - _stroke_width(xh_masks(scaled))) / 2)
    scaled = {ch: _thicken(m, grow) for ch, m in scaled.items()}
    sc = max(4.0, cfg["x_height"] - 2 * grow) / median_raw
    variants = {}
    for ch, masks in raw_more.items():
        variants[ch] = [_thicken(m.resize((max(1, round(m.width * sc)), max(1, round(m.height * sc))), Image.LANCZOS), grow)
                        for m in masks]

    xh = float(np.median([m.height for m in xh_masks(scaled)]))
    caps = [scaled[c].height for c in CAP_CHARS if c in scaled]
    cap_h = float(np.median(caps)) if caps else xh * 1.9

    if cfg.get("clean_dots") and "." in scaled:
        scaled["."] = _clean_dot(scaled["."], xh)
        if "." in variants:
            variants["."] = [_clean_dot(m, xh) for m in variants["."]]

    # ':' is not on the calibration sheet - build it from two of the user's own full stops
    if ":" not in scaled and "." in scaled:
        dot = scaled["."]
        full = max(round(xh * 0.95), dot.height * 2 + 2)
        colon = Image.new("L", (dot.width, full), 0)
        colon.paste(dot, (0, 0))
        colon.paste(dot, (0, full - dot.height))
        scaled[":"] = colon

    # bullet dot: the user's own full stop
    if "\u2022" not in scaled and "." in scaled:
        scaled["\u2022"] = scaled["."].copy()

    return scaled, xh, cap_h, _stroke_width(xh_masks(scaled)), variants


def _shear(gi, deg):
    """Lean a glyph to the right: the top moves right, the bottom stays (the glyph gets a bit wider)."""
    if abs(deg) < 0.1:
        return gi
    k = math.tan(math.radians(deg))
    w, h = gi.size
    extra = int(math.ceil(abs(k) * h)) + 1
    off = k * h if k > 0 else 0.0
    return gi.transform((w + extra, h), Image.AFFINE, (1, k, -off, 0, 1, 0), resample=Image.BICUBIC)


def _top_for(ch, h, base, cap_h, xh):
    if ch in DESCEND:
        return base - h + DESCEND[ch] * h
    if ch in "'\"":
        return base - cap_h
    if ch in "-\u2022":
        return base - 0.55 * xh - h / 2
    return base - h


def _split_long(word, max_w, adv):
    parts, cur, w = [], [], 0.0
    for item in word:
        a = adv(item[0])
        if cur and w + a > max_w:
            parts.append(cur)
            cur, w = [], 0.0
        cur.append(item)
        w += a
    if cur:
        parts.append(cur)
    return parts


def _ends(gi):
    """Where the pen enters (left edge) and leaves (right edge) a placed glyph, in glyph coordinates."""
    a = np.array(gi)
    ys, xs = np.where(a > 100)
    if len(xs) == 0:
        return None
    x0, x1 = int(xs.min()), int(xs.max())
    return x0, float(ys[xs <= x0 + 2].mean()), x1, float(ys[xs >= x1 - 2].mean())


def _draw_connector(page, p0, p1, width, color, rnd, S=4, sag=None):
    """A short, slightly curved pen stroke from p0 to p1 (anti-aliased by 4x supersampling)."""
    (x0, y0), (x1, y1) = p0, p1
    if sag is None:
        sag = rnd.uniform(-0.12, 0.12) * (abs(x1 - x0) + abs(y1 - y0) + width)
    cx, cy = (x0 + x1) / 2.0, (y0 + y1) / 2.0 + sag
    pad = int(width) + 3
    left = int(min(x0, x1)) - pad
    top = int(min(y0, y1, cy)) - pad
    w = int(max(x0, x1)) + pad + 1 - left
    h = int(max(y0, y1, cy)) + pad + 1 - top
    if w <= 0 or h <= 0:
        return
    mask = Image.new("L", (w * S, h * S), 0)
    d = ImageDraw.Draw(mask)
    pts = []
    for i in range(17):
        t = i / 16.0
        bx = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1
        by = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1
        pts.append(((bx - left) * S, (by - top) * S))
    d.line(pts, fill=255, width=max(1, round(width * S)), joint="curve")
    mask = mask.resize((w, h), Image.LANCZOS)
    page.paste(color, (left, top), mask)


def _draw_loop(page, box, width, color, rnd, S=4):
    """A slightly uneven hand-drawn circle around box = (x0, y0, x1, y1)."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2.0, (y0 + y1) / 2.0
    rx = (x1 - x0) / 2.0 + 0.32 * (y1 - y0) + 2 * width
    ry = (y1 - y0) / 2.0 + 0.22 * (y1 - y0) + 2 * width
    start = rnd.uniform(-2.7, -1.9)
    total = 2 * math.pi + rnd.uniform(0.3, 0.7)
    ph = rnd.uniform(0, 6.28)
    pts = []
    for i in range(61):
        f = i / 60.0
        t = start + total * f
        k = 1.0 + 0.05 * math.sin(3 * t + ph) + f * rnd.uniform(0.03, 0.09)
        pts.append((cx + rx * k * math.cos(t), cy + ry * k * math.sin(t)))
    left = int(min(p[0] for p in pts)) - int(width) - 3
    top = int(min(p[1] for p in pts)) - int(width) - 3
    w = int(max(p[0] for p in pts)) + int(width) + 4 - left
    h = int(max(p[1] for p in pts)) + int(width) + 4 - top
    mask = Image.new("L", (w * S, h * S), 0)
    ImageDraw.Draw(mask).line([((x - left) * S, (y - top) * S) for x, y in pts], fill=255,
                              width=max(1, round(width * S)), joint="curve")
    page.paste(color, (left, top), mask.resize((w, h), Image.LANCZOS))


def render_pages(glyphs_b64, parsed, seed=None, cfg=None):
    c = dict(DEFAULT_CFG)
    if cfg:
        c.update(cfg)
    rnd = random.Random(seed)

    scaled, xh, cap_h, stroke_w, variants = _prepare(glyphs_b64, c)
    last_pick = {}
    letter_gap = c["letter_gap"] * xh
    space_w = c["word_gap"] * xh
    skipped = set()
    ruled = bool(c.get("ruled"))

    def widest(ch):
        """Widest sample of a letter (only used to decide whether a single word is longer than a line)."""
        pool = variants.get(ch) or [scaled[ch]]
        return max(g.width for g in pool)

    def split_adv(ch):
        return widest(ch) * 1.08 + letter_gap * 1.3

    pages = []

    def new_page():
        im = Image.new("RGB", (int(c["page_w"]), int(c["page_h"])), (255, 255, 255))
        pages.append(im)
        return im

    page = new_page()
    right = c["page_w"] - c["margin_right"]
    safety = c["right_safety"] * xh
    bottom_limit = c["page_h"] - c["margin_bottom"]
    top_base = c["margin_top"] + cap_h
    base = top_base

    def to_words(spans):
        chars = []
        for text, color in spans:
            for ch in text:
                if ch == " " or ch in scaled:
                    chars.append((ch, color))
                else:
                    skipped.add(ch)
        words, cur = [], []
        for ch, col in chars:
            if ch == " ":
                if cur:
                    words.append(cur)
                    cur = []
            else:
                cur.append((ch, col))
        if cur:
            words.append(cur)
        return words

    def ink_color(col):
        return c["black"] if col.split(":")[0] == "black" else c["blue"]

    def ul_level(col):
        return {"u1": 1, "u2": 2}.get(col.partition(":")[2], 0)

    def is_circle(col):
        return col.partition(":")[2] == "o"

    def plan_word(word):
        """Decide EVERYTHING random about a word once (sample, size, rotation, gaps), so that the width used
        for line wrapping is exactly the width that is drawn."""
        word_s = rnd.uniform(0.95, 1.05)
        word_rot = rnd.uniform(-3.0, 3.0)
        word_dy = rnd.uniform(-c["word_jitter"], c["word_jitter"]) * xh
        items, total = [], 0.0
        for ch, col in word:
            g = scaled[ch]
            if ch in variants:                           # pick a different sample than last time
                opts = [i for i in range(len(variants[ch])) if i != last_pick.get(ch)] or [0]
                last_pick[ch] = rnd.choice(opts)
                g = variants[ch][last_pick[ch]]
            s = word_s * rnd.uniform(0.97, 1.03)
            w = max(1, round(g.width * s))
            h = max(1, round(g.height * s))
            gi = g.resize((w, h), Image.BICUBIC)
            if c["slant_deg"]:
                gi = _shear(gi, c["slant_deg"])
            gi = gi.rotate(word_rot + rnd.uniform(-2.0, 2.0), resample=Image.BICUBIC, expand=True)
            gap = letter_gap * rnd.uniform(0.7, 1.3)
            items.append((ch, col, gi, w, h, gap))
            total += w + gap
        return {
            "items": items,
            "dy": word_dy,
            "adv": total,                                # advance incl. the last letter gap
            "w": total - items[-1][5],                   # visible width of the word
            "space": space_w * rnd.uniform(0.75, 1.3),   # gap AFTER this word
        }

    def plan_line(words):
        return [plan_word(wd) for wd in words]

    def draw_line(line_words, start_x, line_base):
        """Write one line of planned words on `line_base`; returns the x where the writing ended."""
        slope = rnd.uniform(-c["slope"], c["slope"])
        wave_amp = c["wave"] * xh * rnd.uniform(0.5, 1.0)
        wave_len = rnd.uniform(500, 1100)
        wave_ph = rnd.uniform(0, 6.28)
        x = start_x
        ul = None
        runs = []
        last_space = 0.0

        for pw in line_words:
            lvl0 = ul_level(pw["items"][0][1])
            if ul is not None and lvl0 != ul["lvl"]:
                runs.append(ul)
                ul = None

            word_dy = pw["dy"]
            circ = None
            prev_exit = None

            for ch, col, gi, w, h, gap in pw["items"]:
                drift = slope * (x - start_x) + wave_amp * math.sin(2 * math.pi * (x - start_x) / wave_len + wave_ph)
                y_base = line_base + drift + word_dy + rnd.uniform(-0.05, 0.05) * xh
                top = _top_for(ch, h, y_base, cap_h, xh)
                px = round(x + (w - gi.width) / 2)
                py = round(top + (h - gi.height) / 2)

                color = ink_color(col)
                page.paste(color, (px, py), gi)

                if is_circle(col):
                    if circ is None:
                        circ = [px, py, px + gi.width, py + gi.height, color]
                    else:
                        circ[0], circ[1] = min(circ[0], px), min(circ[1], py)
                        circ[2], circ[3] = max(circ[2], px + gi.width), max(circ[3], py + gi.height)

                lvl = ul_level(col)
                if lvl:
                    if ul is None or ul["lvl"] != lvl:
                        if ul is not None:
                            runs.append(ul)
                        ul = {"x0": px, "x1": px + gi.width, "ys": [y_base], "lvl": lvl, "color": color}
                    else:
                        ul["x1"] = px + gi.width
                        ul["ys"].append(y_base)
                elif ul is not None:
                    runs.append(ul)
                    ul = None

                if c["connect"] and ch in LOWER:
                    ends = _ends(gi)
                    if ends:
                        ex0, ey0, ex1, ey1 = ends
                        entry = (px + ex0, py + ey0)
                        if prev_exit is not None:
                            gp = entry[0] - prev_exit[0]
                            dy = entry[1] - prev_exit[1]
                            if stroke_w <= gp <= 0.45 * xh and abs(dy) <= 0.45 * xh:
                                _draw_connector(page, prev_exit, entry,
                                                stroke_w * rnd.uniform(0.7, 0.9), color, rnd)
                        prev_exit = (px + ex1, py + ey1)
                    else:
                        prev_exit = None
                else:
                    prev_exit = None

                x += w + gap
            if circ is not None:
                _draw_loop(page, tuple(circ[:4]), stroke_w * rnd.uniform(0.8, 1.0), circ[4], rnd)
            last_space = pw["space"]
            x += last_space

        if ul is not None:
            runs.append(ul)
        for r in runs:                                   # hand-drawn underlines (single or double)
            y0 = sum(r["ys"]) / len(r["ys"]) + 0.55 * xh
            xa, xb = r["x0"] - 0.15 * xh, r["x1"] + 0.25 * xh
            for k in range(r["lvl"]):
                yy = y0 + k * 0.6 * xh
                tilt = slope * (xb - xa) + rnd.uniform(-0.06, 0.06) * xh
                _draw_connector(page, (xa + rnd.uniform(-0.2, 0.2) * xh * k, yy),
                                (xb + rnd.uniform(-0.3, 0.3) * xh * k, yy + tilt),
                                stroke_w * rnd.uniform(0.75, 0.95), r["color"], rnd,
                                sag=rnd.uniform(-0.01, 0.01) * (xb - xa))
        return x - last_space

    def next_base(b, factor=1.0):
        jitter = 0.0 if ruled else rnd.uniform(-c["line_jitter"], c["line_jitter"])
        return b + c["line_height"] * factor * (1.0 + jitter)

    for ln in parsed["lines"]:
        if ln.get("gap_before") and base > top_base + 1:      # paragraph gap
            gap = 1.0 if ruled else 0.6
            base += gap * c["line_height"] * (1.0 + (0.0 if ruled else rnd.uniform(-c["line_jitter"], c["line_jitter"])))

        if ln.get("tight") and base > top_base + 1 and not ruled:     # "[t]" lines: closer to the line above
            base -= 0.28 * c["line_height"]

        words = to_words(ln["spans"])
        right_words = to_words(ln["right"]) if ln.get("right") else []
        if not words:
            continue

        left = c["margin_left"] + ln.get("indent", 0) * c["indent"]
        usable = right - safety - left

        flat = []
        for wd in words:
            est = sum(split_adv(ch) for ch, _ in wd)
            flat.extend(_split_long(wd, usable, split_adv) if est > usable else [wd])
        words = flat

        planned = plan_line(words)                               # exact widths from here on

        first = "".join(ch for ch, _ in words[0])
        hang = planned[0]["adv"] + space_w if re.fullmatch(r"[-\u2022]|\d+\.", first) else 0

        vlines = []
        line_words, start_x = [], left
        x = start_x
        for pw in planned:
            if line_words and x + pw["w"] > right - safety:
                vlines.append((start_x, line_words))
                line_words, start_x = [], left + hang
                x = start_x
            line_words.append(pw)
            x += pw["adv"] + pw["space"]
        vlines.append((start_x, line_words))

        planned_right = plan_line(right_words) if right_words else []

        for idx, (start_x, line_words) in enumerate(vlines):
            if base + 0.6 * xh > bottom_limit:
                page = new_page()
                base = top_base

            x_end = draw_line(line_words, start_x, base)

            if idx == 0 and planned_right:                # e.g. "Name: ...   ||   Tutorial - 4"
                rx = max(x_end + 3 * space_w, left + c["title_x"] * usable)
                r_w = sum(p["adv"] + p["space"] for p in planned_right) - planned_right[-1]["space"] - planned_right[-1]["items"][-1][5]
                if rx + r_w > right - safety:                 # keep the right part inside the page
                    rx = max(x_end + space_w, right - safety - r_w)
                draw_line(planned_right, rx, base)

            base = next_base(base)

    return pages, {
        "skipped": sorted(skipped),
        "page_count": len(pages),
        "base0": top_base,
        "line_height": c["line_height"],
        "margin_left": c["margin_left"],
    }


def pages_to_pdf_bytes(pages, dpi=DPI):
    buf = io.BytesIO()
    pages[0].save(buf, format="PDF", save_all=True,
                  append_images=pages[1:], resolution=float(dpi), quality=92)
    return buf.getvalue()