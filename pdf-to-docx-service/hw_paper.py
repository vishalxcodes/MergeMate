"""
hw_paper.py - turns the flat white pages from hw_renderer into something that
looks like a photographed sheet of real paper.

  make_paper(...)    -> paper texture, returned as a uint8 HxWx3 array
  composite(...)     -> lays the handwriting on the paper like real ink (multiply blend)
  camera_effect(...) -> slight tilt, lens softness, sensor noise, JPEG re-compression

MEMORY-LIGHT VERSION: all heavy maths runs on strips of STRIP rows (a few MB), never on a
full-page float32 array, and big smooth fields are made at 1/DOWN resolution and stretched per strip.
Peak per call is now about 2-3 full-page uint8 arrays (~12 MB each at 200 dpi) instead of ~300 MB.
Same look as before (same formulas); only the random numbers differ for a given seed.
"""
import io

import cv2
import numpy as np
from PIL import Image

# Paper colours measured from the user's own photos (R, G, B at the paper's centre)
PAPER_TONES = {
    "photo": (143, 152, 180),    # dim, cool/bluish indoor light
    "bright": (172, 176, 189),   # like the brighter blank-sheet photo
    "white": (248, 246, 240),    # idealised scanner white
    "cream": (244, 238, 222),
}

STRIP = 192   # rows processed at a time
DOWN = 4      # big smooth fields are generated at 1/DOWN resolution


def _smooth(h, w, cell, rng):
    """Low-frequency noise in roughly [-1, 1]; `cell` is the blotch size in pixels."""
    gh, gw = max(2, int(h / cell) + 2), max(2, int(w / cell) + 2)
    g = rng.standard_normal((gh, gw), dtype=np.float32)
    g = cv2.resize(g, (w, h), interpolation=cv2.INTER_CUBIC)
    g *= 0.4                                   # == /2.5
    return np.clip(g, -1.0, 1.0, out=g)


def _lo_field(h, w, cell, rng):
    """Smooth field for the whole page, stored at 1/DOWN size (about 1 MB instead of 15 MB)."""
    return _smooth(-(-h // DOWN), -(-w // DOWN), cell / DOWN, rng)


def _rows(lo, y0, y1, w):
    """Rows y0:y1 of a _lo_field stretched back to full width/resolution."""
    r0 = max(0, y0 // DOWN - 1)
    r1 = min(lo.shape[0], -(-y1 // DOWN) + 1)
    big = cv2.resize(lo[r0:r1], (w, (r1 - r0) * DOWN), interpolation=cv2.INTER_CUBIC)
    off = y0 - r0 * DOWN
    return big[off:off + (y1 - y0)]


def make_paper(w, h, style="plain", tone="photo", seed=None, ruled=None, dpi=200):
    """
    style: "ruled" (needs `ruled`) or "plain"
    ruled: {"line_height": px, "base0": px (first text baseline), "margin_x": px}
    Returns a uint8 array (h, w, 3).
    """
    rng = np.random.default_rng(seed)
    mm = dpi / 25.4
    base = np.array(PAPER_TONES.get(tone, PAPER_TONES["photo"]), np.float32)

    ang = rng.uniform(0, 2 * np.pi)
    ca, sa = float(np.cos(ang)), float(np.sin(ang))
    th = rng.uniform(0, np.pi)
    ct, st = float(np.cos(th)), float(np.sin(th))
    period = float(95.0 * mm / 5.9)
    ph = float(rng.uniform(0, 6.28))
    f_fold = _lo_field(h, w, 500, rng)
    f_light = _lo_field(h, w, 380, rng)

    use_ruled = style == "ruled" and bool(ruled)
    if use_ruled:
        lh = float(ruled["line_height"])
        first = float(ruled["base0"]) + 0.04 * lh
        y = first - int((first - 10 * mm) // lh) * lh
        line_ys = []
        while y < h - 10 * mm:
            line_ys.append(y)
            y += lh
        f_line = _lo_field(h, w, 60, rng)
        mx = ruled.get("margin_x")
        line_rgb = np.array((104, 140, 196), np.float32) / 255.0
        red = np.array((205, 100, 100), np.float32) / 255.0

    xs = np.arange(w, dtype=np.float32)
    xn = (xs / w - 0.5)[None, :]
    out = np.empty((h, w, 3), np.uint8)

    for y0 in range(0, h, STRIP):
        y1 = min(h, y0 + STRIP)
        n = y1 - y0
        ys = np.arange(y0, y1, dtype=np.float32)[:, None]
        yn = ys / h - 0.5

        grad = (xn * ca + yn * sa) * 0.045                           # ~7% across the sheet
        vign = -0.04 * ((xn ** 2 + yn ** 2) * 2.0)
        wave = np.sin((xs[None, :] * ct + ys * st) / period + ph)    # soft folds of the sheet
        folds = 0.010 * wave * (0.5 + 0.5 * _rows(f_fold, y0, y1, w))
        light = 1.0 + grad + vign + folds + 0.012 * _rows(f_light, y0, y1, w)
        grain = (1.0
                 + 0.0050 * rng.standard_normal((n, w), dtype=np.float32)
                 + 0.0030 * _smooth(n, w, 5, rng))
        strip = (light * grain)[:, :, None] * base[None, None, :]

        if use_ruled:
            lm = np.zeros((n, w), np.float32)
            for yl in line_ys:
                if y0 - 4 <= yl < y1 + 4:
                    yy = int(round(yl)) - y0
                    cv2.line(lm, (0, yy), (w - 1, yy), 1.0, 1, cv2.LINE_AA)
            lm = cv2.GaussianBlur(lm, (0, 0), 0.6)
            lm *= 0.62 * (0.8 + 0.25 * _rows(f_line, y0, y1, w))
            strip *= 1.0 - lm[:, :, None] * (1.0 - line_rgb)[None, None, :]
            if mx:
                mg = np.zeros((n, w), np.float32)
                cv2.line(mg, (int(mx), 0), (int(mx), n - 1), 1.0, 1, cv2.LINE_AA)
                mg = cv2.GaussianBlur(mg, (0, 0), 0.6) * 0.55
                strip *= 1.0 - mg[:, :, None] * (1.0 - red)[None, None, :]

        out[y0:y1] = np.clip(strip + 0.5, 0, 255)
    return out


def composite(page_img, paper, seed=None):
    """Lay the rendered handwriting (dark ink on white) onto the paper like real ink.
    `paper` = uint8 (or float) array from make_paper."""
    rng = np.random.default_rng(seed)
    if page_img.mode != "RGB":
        page_img = page_img.convert("RGB")
    w, h = page_img.size
    f_press = _lo_field(h, w, 90, rng)
    out = np.empty((h, w, 3), np.uint8)
    PAD = 3                                                          # overlap rows for the blur

    for y0 in range(0, h, STRIP):
        y1 = min(h, y0 + STRIP)
        n = y1 - y0
        a0, a1 = max(0, y0 - PAD), min(h, y1 + PAD)
        ink = 1.0 - np.asarray(page_img.crop((0, a0, w, a1))).astype(np.float32) * (1.0 / 255.0)

        ink *= 1.10                                                  # pen ink is dense, not solid black
        np.clip(ink, 0.0, 1.0, out=ink)
        pressure = (0.94 + 0.06 * _rows(f_press, a0, a1, w)
                    + 0.04 * _smooth(a1 - a0, w, 7, rng))
        np.clip(pressure, 0.86, 1.0, out=pressure)
        ink *= pressure[:, :, None]
        ink = cv2.GaussianBlur(ink, (0, 0), 0.5)                     # ink bleeds a little
        ink *= (1.0 - 0.05 * rng.random((a1 - a0, w), dtype=np.float32))[:, :, None]
        ink = ink[y0 - a0:y0 - a0 + n]

        res = paper[y0:y1].astype(np.float32) * (1.0 - ink)          # multiply blend
        out[y0:y1] = np.clip(res + 0.5, 0, 255)
    return Image.fromarray(out)


def camera_effect(img, seed=None):
    """Small tilt, lens softness, sensor noise and JPEG artefacts, like a phone photo."""
    rng = np.random.default_rng(seed)
    if img.mode != "RGB":
        img = img.convert("RGB")
    arr = np.asarray(img)
    h, w = arr.shape[:2]

    M = cv2.getRotationMatrix2D((w / 2.0, h / 2.0), float(rng.uniform(-0.5, 0.5)), 1.0)
    arr = cv2.warpAffine(arr, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    cv2.GaussianBlur(arr, (0, 0), 0.5, dst=arr)

    for y0 in range(0, h, STRIP):                                    # sensor noise, strip by strip
        blk = arr[y0:y0 + STRIP]
        noise = rng.standard_normal(blk.shape, dtype=np.float32)
        noise += blk
        arr[y0:y0 + STRIP] = np.clip(noise, 0, 255)

    out = Image.fromarray(arr)
    buf = io.BytesIO()
    out.save(buf, "JPEG", quality=90)
    buf.seek(0)
    return Image.open(buf).convert("RGB")