"""
hw_paper.py - turns the flat white pages from hw_renderer into something that
looks like a photographed sheet of real paper.

  make_paper(...)    -> paper texture (uneven light, grain, optional ruled lines + margin)
  composite(...)     -> lays the handwriting on the paper like real ink (multiply blend,
                        uneven pen pressure, soft edges)
  camera_effect(...) -> slight tilt, lens softness, sensor noise, JPEG re-compression
"""
import io

import cv2
import numpy as np
from PIL import Image

# Paper colours measured from the user's own photos (R, G, B at the paper's centre)
PAPER_TONES = {
    "photo": (143, 152, 180),    # measured from your photos: dim, cool/bluish indoor light
    "bright": (172, 176, 189),   # like the brighter blank-sheet photo
    "white": (248, 246, 240),    # idealised scanner white
    "cream": (244, 238, 222),
}


def _smooth(h, w, cell, rng):
    """Low-frequency noise in roughly [-1, 1]; `cell` is the blotch size in pixels."""
    gh, gw = max(2, int(h / cell) + 2), max(2, int(w / cell) + 2)
    g = rng.standard_normal((gh, gw)).astype(np.float32)
    g = cv2.resize(g, (w, h), interpolation=cv2.INTER_CUBIC)
    return np.clip(g / 2.5, -1.0, 1.0)


def make_paper(w, h, style="plain", tone="photo", seed=None, ruled=None, dpi=200):
    """
    style: "ruled" (needs `ruled`) or "plain"
    ruled: {"line_height": px, "base0": px (first text baseline), "margin_x": px}
    """
    rng = np.random.default_rng(seed)
    mm = dpi / 25.4
    base = np.array(PAPER_TONES.get(tone, PAPER_TONES["photo"]), np.float32)

    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    ang = rng.uniform(0, 2 * np.pi)
    grad = ((xx / w - 0.5) * np.cos(ang) + (yy / h - 0.5) * np.sin(ang)) * 0.045   # ~7% across the sheet
    vign = -0.04 * (((xx / w - 0.5) ** 2 + (yy / h - 0.5) ** 2) * 2.0)
    # soft folds / waves of the sheet: broad shallow bands, strongest in patches
    th = rng.uniform(0, np.pi)
    wave = np.sin((xx * np.cos(th) + yy * np.sin(th)) / (95.0 * mm / 5.9) + rng.uniform(0, 6.28))
    folds = 0.010 * wave * (0.5 + 0.5 * _smooth(h, w, 500, rng))
    light = 1.0 + grad + vign + folds + 0.012 * _smooth(h, w, 380, rng)
    # real phone photos are very smooth: fine grain std is only ~0.5 of 255
    grain = (1.0
             + 0.0050 * rng.standard_normal((h, w)).astype(np.float32)
             + 0.0030 * _smooth(h, w, 5, rng))
    paper = base[None, None, :] * (light * grain)[:, :, None]

    if style == "ruled" and ruled:
        lh = float(ruled["line_height"])
        first = float(ruled["base0"]) + 0.04 * lh        # the pen sits right on the line
        y = first - int((first - 10 * mm) // lh) * lh    # walk up to the top of the sheet
        lines = np.zeros((h, w), np.float32)
        while y < h - 10 * mm:
            cv2.line(lines, (0, int(round(y))), (w - 1, int(round(y))), 1.0, 1, cv2.LINE_AA)
            y += lh
        lines = cv2.GaussianBlur(lines, (0, 0), 0.6)
        lines *= 0.62 * (0.8 + 0.25 * _smooth(h, w, 60, rng))
        line_rgb = np.array((104, 140, 196), np.float32) / 255.0
        paper *= 1.0 - lines[:, :, None] * (1.0 - line_rgb)[None, None, :]

        mx = ruled.get("margin_x")
        if mx:
            margin = np.zeros((h, w), np.float32)
            cv2.line(margin, (int(mx), 0), (int(mx), h - 1), 1.0, 1, cv2.LINE_AA)
            margin = cv2.GaussianBlur(margin, (0, 0), 0.6) * 0.55
            red = np.array((205, 100, 100), np.float32) / 255.0
            paper *= 1.0 - margin[:, :, None] * (1.0 - red)[None, None, :]

    return paper


def composite(page_img, paper, seed=None):
    """Lay the rendered handwriting (dark ink on white) onto the paper like real ink."""
    rng = np.random.default_rng(seed)
    page = np.asarray(page_img.convert("RGB"), np.float32) / 255.0
    ink = 1.0 - page
    h, w = ink.shape[:2]

    ink = np.clip(ink * 1.10, 0.0, 1.0)                              # pen ink is fairly dense, not solid black
    pressure = 0.94 + 0.06 * _smooth(h, w, 90, rng) + 0.04 * _smooth(h, w, 7, rng)
    ink *= np.clip(pressure, 0.86, 1.0)[:, :, None]
    ink = cv2.GaussianBlur(ink, (0, 0), 0.5)                         # ink bleeds a little
    ink *= (1.0 - 0.05 * rng.random((h, w), dtype=np.float32))[:, :, None]  # not perfectly solid

    out = paper * (1.0 - ink)                                       # multiply blend
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def camera_effect(img, seed=None):
    """Small tilt, lens softness, sensor noise and JPEG artefacts, like a phone photo."""
    rng = np.random.default_rng(seed)
    arr = np.asarray(img.convert("RGB"), np.float32)
    h, w = arr.shape[:2]

    M = cv2.getRotationMatrix2D((w / 2.0, h / 2.0), float(rng.uniform(-0.5, 0.5)), 1.0)
    arr = cv2.warpAffine(arr, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    arr = cv2.GaussianBlur(arr, (0, 0), 0.5)
    arr += rng.standard_normal(arr.shape, dtype=np.float32)

    out = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    buf = io.BytesIO()
    out.save(buf, "JPEG", quality=90)
    buf.seek(0)
    return Image.open(buf).convert("RGB")