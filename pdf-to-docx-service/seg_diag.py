"""
seg_diag.py - shows what the REAL binarization + hw_segmenter produce for one sheet photo.

Run from G:\MergeMate\pdf-to-docx-service (same folder as app.py):
    venv\Scripts\python.exe seg_diag.py yash.jpg
    venv\Scripts\python.exe seg_diag.py yash.jpg cw      (optional forced rotation: cw / ccw / 180 / none)

Writes <name>_bin.png (the binary image the segmenter sees) and <name>_overlay.png (every glyph boxed,
number = line index) and prints a per-line table + the segmenter's debug events.
"""
import sys
import cv2
import numpy as np

import hw_segmenter as S
from app import _hw_load_and_binarize

name = sys.argv[1] if len(sys.argv) > 1 else "yash.jpg"
rot = sys.argv[2] if len(sys.argv) > 2 else "none"
rot = None if rot == "none" else rot
stem = name.rsplit(".", 1)[0]

img, binary = _hw_load_and_binarize(open(name, "rb").read(), rot)
H, W = binary.shape[:2]
print(f"after crop: width={W} height={H} scale={W / 1000.0:.2f}")
cv2.imwrite(f"{stem}_bin.png", binary)

S.DEBUG_LOG = []
blobs, row_sizes = S.segment_blobs(binary, W / 1000.0)
print("blobs:", len(blobs), "| row_sizes:", row_sizes, "| orientation_score:", S.orientation_score(blobs, row_sizes))
for ev in S.DEBUG_LOG:
    print("log:", ev)

vis = img.copy()
colors = [(0, 0, 255), (255, 0, 0), (0, 160, 0), (0, 140, 255)]
print("\nline  n   y_first  median_h  min_w  max_w")
k = 0
for r, n in enumerate(row_sizes):
    grp = blobs[k:k + n]
    k += n
    col = colors[r % 4]
    for g in grp:
        cv2.rectangle(vis, (g["x"], g["y"]), (g["x"] + g["w"], g["y"] + g["h"]), col, 2)
        cv2.putText(vis, str(r), (g["x"], max(12, g["y"] - 4)), cv2.FONT_HERSHEY_SIMPLEX, 0.7, col, 2)
    hs = [g["h"] for g in grp]
    ws = [g["w"] for g in grp]
    print(f"{r:>3}  {n:>2}  {grp[0]['y']:>7}  {int(np.median(hs)):>8}  {min(ws):>5}  {max(ws):>5}")
cv2.imwrite(f"{stem}_overlay.png", vis)
print(f"\nsaved {stem}_bin.png and {stem}_overlay.png")