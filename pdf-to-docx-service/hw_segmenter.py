"""
hw_segmenter.py  -  glyph segmentation for the handwriting calibration sheet.

Replaces _hw_detect_rows + _hw_detect_blobs_in_row.

Why the old approach failed: it first looked for text lines using the ink density
of whole horizontal bands. When two lines are written close together (descenders of
line 1 almost touch ascenders of line 2) the bands merge, and a vertical "bridge"
then glued letters of different lines together (f+u, g+V, j+y).

New approach:
  1. find separate pen-stroke components (no vertical bridging),
  2. attach only small dot-like marks (i, j, ?, ! dots, quote ticks) to their letter,
  3. estimate the page tilt, group glyphs into lines by their vertical centre,
  4. sort lines top -> bottom and glyphs left -> right.
"""
import cv2
import numpy as np


def _ink_and_background(binary):
    b = binary if binary.ndim == 2 else cv2.cvtColor(binary, cv2.COLOR_BGR2GRAY)
    white_ink = float((b > 127).mean()) < 0.5          # ink is always the minority colour
    ink = ((b > 127) if white_ink else (b <= 127)).astype(np.uint8) * 255
    bg_value = 0 if white_ink else 255
    return b, ink, bg_value


def _stroke_components(ink, scale, min_area):
    kx = 2 * max(1, round(2.0 * scale)) + 1
    ky = 2 * max(1, round(1.0 * scale)) + 1
    closed = cv2.dilate(ink, cv2.getStructuringElement(cv2.MORPH_RECT, (kx, ky)))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(closed, connectivity=8)
    H, W = ink.shape
    edge = 1
    comps = []
    for i in range(1, n):
        x, y, w, h, _ = stats[i]
        sel = (lab[y:y + h, x:x + w] == i) & (ink[y:y + h, x:x + w] > 0)
        ys, xs = np.where(sel)
        if len(xs) < min_area:
            continue
        x0, x1, y0, y1 = int(xs.min() + x), int(xs.max() + x), int(ys.min() + y), int(ys.max() + y)
        # junk along the border of the photo (paper edge, shadows)
        if x0 <= edge or y0 <= edge or x1 >= W - 1 - edge or y1 >= H - 1 - edge:
            continue
        comps.append({"x0": x0, "x1": x1, "y0": y0, "y1": y1, "area": int(len(xs)), "ids": {i}})
    return comps, lab


def _merge(a, b):
    return {
        "x0": min(a["x0"], b["x0"]), "x1": max(a["x1"], b["x1"]),
        "y0": min(a["y0"], b["y0"]), "y1": max(a["y1"], b["y1"]),
        "area": a["area"] + b["area"], "ids": a["ids"] | b["ids"],
    }


def _attach_dots(comps):
    h = lambda c: c["y1"] - c["y0"] + 1
    w = lambda c: c["x1"] - c["x0"] + 1
    href = float(np.median([h(c) for c in comps]))
    dots = [c for c in comps if h(c) <= 0.45 * href and w(c) <= 0.6 * href]
    big = [c for c in comps if all(c is not d for d in dots)]
    leftover = []
    for d in dots:
        dcx = (d["x0"] + d["x1"]) / 2
        best, best_gap = None, 1e9
        for k, b in enumerate(big):
            if not (b["x0"] - 0.25 * href <= dcx <= b["x1"] + 0.25 * href):
                continue
            gap = max(b["y0"] - d["y1"], d["y0"] - b["y1"], 0)
            if gap <= 0.8 * href and gap < best_gap:
                best, best_gap = k, gap
        if best is not None:
            big[best] = _merge(big[best], d)
        else:
            leftover.append(d)
    leftover.sort(key=lambda c: c["x0"])
    tidy = []
    for d in leftover:                      # e.g. the two ticks of the " character
        if tidy:
            p = tidy[-1]
            hgap = d["x0"] - p["x1"]
            dy = abs((d["y0"] + d["y1"]) / 2 - (p["y0"] + p["y1"]) / 2)
            if hgap <= 0.32 * href and dy <= 0.35 * href:
                tidy[-1] = _merge(p, d)
                continue
        tidy.append(d)
    return big + tidy


def _estimate_skew_deg(comps):
    cx = np.array([(c["x0"] + c["x1"]) / 2 for c in comps])
    cy = np.array([(c["y0"] + c["y1"]) / 2 for c in comps])
    mh = float(np.median([c["y1"] - c["y0"] + 1 for c in comps]))
    best, best_angle = -1.0, 0.0
    for a in np.arange(-4.0, 4.01, 0.1):
        t = np.deg2rad(a)
        yy = cy * np.cos(t) - cx * np.sin(t)
        bins = int((yy.max() - yy.min()) / (mh / 4)) + 1
        hist, _ = np.histogram(yy, bins=max(bins, 2))
        score = float((hist.astype(float) ** 2).sum())
        if score > best:
            best, best_angle = score, float(a)
    return best_angle


def _order(comps):
    t = np.deg2rad(_estimate_skew_deg(comps))
    for c in comps:
        x, y = (c["x0"] + c["x1"]) / 2, (c["y0"] + c["y1"]) / 2
        c["rx"] = x * np.cos(t) + y * np.sin(t)
        c["ry"] = y * np.cos(t) - x * np.sin(t)
    mh = float(np.median([c["y1"] - c["y0"] + 1 for c in comps]))
    by_y = sorted(comps, key=lambda c: c["ry"])
    rows, cur = [], [by_y[0]]
    for a, b in zip(by_y, by_y[1:]):
        if b["ry"] - a["ry"] > 0.55 * mh:   # a clear vertical jump = new line
            rows.append(cur)
            cur = []
        cur.append(b)
    rows.append(cur)
    ordered = [c for r in rows for c in sorted(r, key=lambda c: c["rx"])]
    return ordered, [len(r) for r in rows]


def segment_blobs(binary, scale):
    """
    binary: the binarized sheet from _hw_load_and_binarize (ink = minority colour)
    scale : binary.shape[1] / 1000.0
    returns (blobs, row_sizes) - blobs are in reading order and each has "crop",
    the same kind of image slice the old _hw_detect_blobs_in_row produced (own glyph only).
    """
    b, ink, bg_value = _ink_and_background(binary)
    min_area = max(25, int(12 * scale * scale))
    comps, lab = _stroke_components(ink, scale, min_area)
    if not comps:
        return [], []
    comps = _attach_dots(comps)
    ordered, row_sizes = _order(comps)

    blobs = []
    for c in ordered:
        y0, y1, x0, x1 = c["y0"], c["y1"] + 1, c["x0"], c["x1"] + 1
        crop = b[y0:y1, x0:x1].copy()
        own = np.isin(lab[y0:y1, x0:x1], list(c["ids"]))
        # keep only this glyph's own pixels (a neighbour's tail must not leak in)
        keep = cv2.dilate(own.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
        crop[~keep] = bg_value
        blobs.append({"crop": crop, "x": c["x0"], "y": c["y0"],
                      "w": c["x1"] - c["x0"] + 1, "h": c["y1"] - c["y0"] + 1})
    return blobs, row_sizes