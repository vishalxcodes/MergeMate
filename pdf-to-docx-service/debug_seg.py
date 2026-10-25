"""
debug_seg.py - shows exactly what the segmenter sees in a calibration photo.   (stand-alone)

    python debug_seg.py abc2.jpg
    python debug_seg.py abc3.jpg
    python debug_seg.py abc2.jpg ccw        <- force a rotation: cw, ccw, 180, none

Needs only hw_segmenter.py in the same folder (the app.py code is copied in below).
Writes debug_<photo>.png: every detected glyph is boxed and numbered in reading order, with the
character that should be at that position, e.g. "9=i", "27=A", "63=." (63=. 64=, 65=? 66=! 67=' 68=" 69=-).
"""
import os
import sys

import cv2
import numpy as np

from hw_segmenter import segment_blobs, orientation_score

# ---- same functions as in app.py -------------------------------------------------------------


def _hw_paper_contour(img):
    """The sheet = the biggest smooth, bright region.  Carpet, book covers and tablecloth are
    textured, so they are left out even where they are bright.  The pen strokes are erased first
    (morphological closing) so the handwriting itself does not count as texture."""
    H, W = img.shape[:2]
    k = max(11, int(0.008 * max(H, W))) | 1
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    clean = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
    _, otsu = cv2.threshold(cv2.GaussianBlur(clean, (7, 7), 0), 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    g = cv2.GaussianBlur(clean, (5, 5), 0).astype(np.float32)
    gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3)
    tex = cv2.GaussianBlur(np.sqrt(gx * gx + gy * gy), (0, 0), 10)
    mask = ((otsu > 0) & (tex < 4.5)).astype(np.uint8) * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((15, 15), np.uint8))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41)))
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None
    largest = max(contours, key=cv2.contourArea)
    return largest if cv2.contourArea(largest) >= 0.15 * H * W else None


def _hw_detect_and_crop_paper(img):
    contour = _hw_paper_contour(img)
    if contour is None:
        return img

    peri = cv2.arcLength(contour, True)
    approx = cv2.approxPolyDP(contour, 0.02 * peri, True)
    if len(approx) == 4:
        box = approx.reshape(4, 2).astype(np.float32)
    else:
        box = cv2.boxPoints(cv2.minAreaRect(contour))

    pts = box[np.argsort(box[:, 1])]
    top_two = pts[:2][np.argsort(pts[:2][:, 0])]
    bottom_two = pts[2:][np.argsort(pts[2:][:, 0])]
    ordered = np.array([top_two[0], top_two[1], bottom_two[1], bottom_two[0]], dtype=np.float32)

    (tl, tr, br, bl) = ordered
    width = int(max(np.linalg.norm(tr - tl), np.linalg.norm(br - bl)))
    height = int(max(np.linalg.norm(bl - tl), np.linalg.norm(br - tr)))
    if width < 10 or height < 10:
        return img

    dst = np.array([[0, 0], [width - 1, 0], [width - 1, height - 1], [0, height - 1]], dtype=np.float32)
    matrix = cv2.getPerspectiveTransform(ordered, dst)
    warped = cv2.warpPerspective(img, matrix, (width, height))

    top_margin = max(1, int(height * 0.03))
    right_margin = max(1, int(width * 0.03))
    bottom_margin = max(1, int(height * 0.015))
    return warped[top_margin:height - bottom_margin, 0:width - right_margin]


def _hw_load_and_binarize(image_bytes, rotate=None):
    file_bytes = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")

    # Work at a fixed size: phone photos are often 4000+ px and the thresholds below are tuned for
    # ~2600 px.  (Also keeps memory low on the server.)
    longest = max(img.shape[:2])
    if longest > 2600:
        f = 2600.0 / longest
        img = cv2.resize(img, None, fx=f, fy=f, interpolation=cv2.INTER_AREA)

    if rotate == "cw":
        img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
    elif rotate == "ccw":
        img = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
    elif rotate == "180":
        img = cv2.rotate(img, cv2.ROTATE_180)

    img = _hw_detect_and_crop_paper(img)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    binary = cv2.adaptiveThreshold(
        blurred, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        blockSize=35,
        C=15,
    )
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
    return img, cleaned


def _hw_segment_auto(image_bytes, rotate=None):
    """Segment the calibration photo.  If the photo is sideways / upside down, the right rotation
    is found automatically (upright first, so normal photos cost nothing extra).
    Pass rotate="cw" | "ccw" | "180" | "none" to force one."""
    if rotate in ("cw", "ccw", "180", "none"):
        options = [rotate]
    else:
        options = ["none", "ccw", "cw", "180"]

    best = None
    for rot in options:
        img, binary = _hw_load_and_binarize(image_bytes, None if rot == "none" else rot)
        blobs, row_sizes = segment_blobs(binary, binary.shape[1] / 1000.0)
        score = orientation_score(blobs, row_sizes)
        if best is None or score < best[0]:
            best = (score, rot, blobs, row_sizes)
        if score <= 3:          # looks like a correct calibration sheet - stop trying
            break
    return best[2], best[3], best[1]


# ---- debug picture ---------------------------------------------------------------------------
SEQ = list("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,?!'\"-")

path = sys.argv[1] if len(sys.argv) > 1 else "abc2.jpg"
if not os.path.isfile(path):
    raise SystemExit("Photo not found: " + os.path.abspath(path) + "  (put it in this folder or give the full path)")
data = open(path, "rb").read()
blobs, rows, rot = _hw_segment_auto(data, sys.argv[2] if len(sys.argv) > 2 else None)
img, binary = _hw_load_and_binarize(data, None if rot == "none" else rot)

print("photo:", path, "| rotation used:", rot, "| detected:", len(blobs), "| rows:", rows)
vis = cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)
pos = 0
for n in rows:
    for _ in range(n):
        b = blobs[pos]
        label = SEQ[pos] if pos < len(SEQ) else "?"
        cv2.rectangle(vis, (b["x"], b["y"]), (b["x"] + b["w"], b["y"] + b["h"]), (0, 0, 255), 3)
        cv2.putText(vis, f"{pos + 1}={label}", (b["x"], max(22, b["y"] - 6)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 120, 0), 2)
        pos += 1
s = 1400 / vis.shape[1]
out = "debug_" + os.path.splitext(os.path.basename(path))[0] + ".png"
cv2.imwrite(out, cv2.resize(vis, None, fx=s, fy=s))
print("saved", os.path.abspath(out))