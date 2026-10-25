"""
compare.py - put your ORIGINAL handwritten-page photo next to the GENERATED page,
and print the same measurements for both so you can see what to polish.

Usage (from the pdf-to-docx-service folder):
    python compare.py --original 37602.jpg --rotate cw
    python compare.py --original 37602.jpg --rotate cw --result result_123456_1.png

--rotate  how to turn the original photo so the text reads upright:
          cw (90 deg clockwise), ccw, 180, or none
--result  generated page (default: the newest result_*_1.png in this folder)
"""
import argparse
import glob
import os
import time

import cv2
import numpy as np
from PIL import Image, ImageDraw

A4_WIDTH_MM = 210.0


def load_original(path, rotate):
    if not os.path.isfile(path):
        raise SystemExit(
            "Original photo not found: " + os.path.abspath(path) + "\n"
            "Copy the photo into this folder (check its exact name and extension), or pass the full path:\n"
            '  python compare.py --original "C:\\Users\\you\\Pictures\\photo.jpg" --rotate cw')
    # imdecode works even when the folder name has spaces / non-English characters
    img = cv2.imdecode(np.fromfile(path, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise SystemExit("Could not read this file as an image: " + os.path.abspath(path))
    a = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    if rotate == "cw":
        a = cv2.rotate(a, cv2.ROTATE_90_CLOCKWISE)
    elif rotate == "ccw":
        a = cv2.rotate(a, cv2.ROTATE_90_COUNTERCLOCKWISE)
    elif rotate == "180":
        a = cv2.rotate(a, cv2.ROTATE_180)
    return a.astype(np.float32)


def crop_paper(a):
    """Cut the sheet out of a photo (bluish-bright paper vs. the dark patterned carpet).
    Returns (crop, paper_mask_of_crop)."""
    R, B = a[:, :, 0], a[:, :, 2]
    lum = a.mean(2)
    mask = ((B > R * 1.08) & (lum > 105)).astype(np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(mask)
    if n < 2:
        return a, np.ones(a.shape[:2], bool)
    k = 1 + int(np.argmax(st[1:, 4]))
    x, y, w, h, _ = st[k]
    return a[y:y + h, x:x + w], (lab[y:y + h, x:x + w] == k)


def measure(rgb, paper_mask=None):
    """rgb: float32 HxWx3 crop of exactly one sheet. Returns a dict of numbers."""
    h, w = rgb.shape[:2]
    px_mm = w / A4_WIDTH_MM
    lum = rgb.mean(2)
    paper_lum = float(np.percentile(lum, 60))
    R, B = rgb[:, :, 0], rgb[:, :, 2]
    ink = ((lum < paper_lum * 0.62) & (B > R * 1.15)).astype(np.uint8)
    ink_d = cv2.dilate(ink, np.ones((9, 9), np.uint8)) > 0
    if paper_mask is None:
        paper_mask = np.ones(lum.shape, bool)
    paper_mask = cv2.erode(paper_mask.astype(np.uint8), np.ones((31, 31), np.uint8)) > 0
    ink_d = ink_d | ~paper_mask          # ignore ink, carpet, book edges

    paper_px = rgb[~ink_d & (lum > paper_lum * 0.8)]
    out = {"paper RGB": tuple(int(v) for v in paper_px.mean(0))}

    g = lum.copy()
    g[ink_d] = np.median(lum[~ink_d])
    low_src = g
    out["paper noise (std)"] = round(float((g - cv2.GaussianBlur(g, (0, 0), 2)).std()), 2)
    low = cv2.GaussianBlur(g, (0, 0), max(10, w // 25))
    m = int(min(h, w) * 0.1)
    out["light variation across sheet %"] = round(100 * float(np.ptp(low[m:-m, m:-m])) / float(g.mean()), 1)

    ink_px = rgb[ink > 0]
    out["ink RGB (median)"] = tuple(int(v) for v in np.median(ink_px, 0)) if len(ink_px) else None

    dt = cv2.distanceTransform(np.pad(ink, 2), cv2.DIST_L2, 3)
    out["pen thickness mm"] = round(2.2 * float(dt[dt > 0].mean()) / px_mm, 2) if (dt > 0).any() else None

    n, lab, st, _ = cv2.connectedComponentsWithStats(cv2.dilate(ink, np.ones((3, 3), np.uint8)))
    hs = [s[3] for s in st[1:] if 0.06 * px_mm * 10 < s[3] < 15 * px_mm and s[4] > 40]
    out["letter height mm (median)"] = round(float(np.median(hs)) / px_mm, 2) if hs else None

    prof = ink.sum(1).astype(np.float32)
    prof -= prof.mean()
    ac = np.correlate(prof, prof, "full")[len(prof) - 1:]
    if ac[0] > 0:
        ac /= ac[0]
        lo, hi = int(6 * px_mm), int(16 * px_mm)
        out["line spacing mm"] = round((lo + int(np.argmax(ac[lo:hi]))) / px_mm, 1)

    if out.get("letter height mm (median)") and out.get("line spacing mm"):
        out["letter height / line spacing"] = round(out["letter height mm (median)"] / out["line spacing mm"], 2)

    ys, xs = np.where(ink > 0)
    if len(xs):
        x0, x1 = np.percentile(xs, [0.5, 99.5])
        y0 = np.percentile(ys, 0.5)
        out["text left margin mm"] = round(float(x0) / px_mm, 1)
        out["text right margin mm"] = round(float(w - x1) / px_mm, 1)
        out["text top margin mm"] = round(float(y0) / px_mm, 1)
        out["ink coverage %"] = round(100 * float(ink.mean()), 2)
    return out


def side_by_side(left, right, height=1500):
    def fit(a):
        im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
        return im.resize((round(im.width * height / im.height), height), Image.LANCZOS)

    l, r = fit(left), fit(right)
    top, gap = 44, 24
    canvas = Image.new("RGB", (l.width + r.width + gap * 3, height + top + gap), (30, 30, 30))
    d = ImageDraw.Draw(canvas)
    d.text((gap, 12), "ORIGINAL (your photo)", fill=(255, 255, 255))
    d.text((gap * 2 + l.width, 12), "GENERATED", fill=(255, 255, 255))
    canvas.paste(l, (gap, top))
    canvas.paste(r, (gap * 2 + l.width, top))
    return canvas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--original", required=True)
    ap.add_argument("--rotate", default="none", choices=["cw", "ccw", "180", "none"])
    ap.add_argument("--result")
    args = ap.parse_args()

    result = args.result
    if not result:
        # newest by the time it was MADE (not by name, so old files can never win)
        found = glob.glob("result_*_1.png")
        result = max(found, key=os.path.getmtime) if found else None
    if not result or not os.path.isfile(result):
        raise SystemExit("No generated page found - run test_render.py first")

    def made(p):
        return time.strftime("%d %b %H:%M:%S", time.localtime(os.path.getmtime(p)))

    print("ORIGINAL : %s   (file saved %s)" % (os.path.abspath(args.original), made(args.original)))
    print("GENERATED: %s   (made %s)" % (os.path.abspath(result), made(result)))
    print("-> check these two are the pages you want to compare!")

    orig, orig_mask = crop_paper(load_original(args.original, args.rotate))
    aspect = orig.shape[0] / orig.shape[1]
    gen = np.asarray(Image.open(result).convert("RGB"), np.float32)

    mo, mg = measure(orig, orig_mask), measure(gen)
    print(f"\n{'':34}{'ORIGINAL':>20}{'GENERATED':>20}")
    for k in mo:
        print(f"{k:34}{str(mo[k]):>20}{str(mg.get(k)):>20}")

    if abs(aspect - 1.414) > 0.1:
        print("\nNote: the sheet in the photo is not fully visible / is skewed (height:width = %.2f, A4 = 1.41),"
              "\n      so the mm values and margins of the ORIGINAL are only approximate." % aspect)

    out = f"compare_{time.strftime('%H%M%S')}.png"
    side_by_side(orig, gen).save(out)
    print(f"\nSaved side-by-side image: {os.path.abspath(out)}")


if __name__ == "__main__":
    main()