r"""
blob_sheet.py - segmenter ke saare blobs ek numbered contact sheet mein dikhata hai.

Run (venv ke python se, kyunki Pillow venv mein hai):
    venv\Scripts\python.exe blob_sheet.py friend_seg.json

Output: blob_sheet.png
 - har row ke upar: "row N: mile X / chahiye Y"  (mismatch wali row laal)
 - har blob ke upar uska global number, neeche woh letter jo template ke hisaab se wahan hona chahiye
   (jahan se letters "khisakne" lagein, wahi se pehla toota/extra/missing blob hai)
"""
import base64
import io
import json
import sys

from PIL import Image, ImageDraw, ImageFont

EXPECTED_ROWS = ["abcdefghijkl", "mnopqrstuvwx", "yz", "ABCDEFGHIJKL", "MNOPQRSTUVWX", "YZ", "0123456789", None]
EXPECTED_SIZES = [12, 12, 2, 12, 12, 2, 10, 7]
CELL_W, CELL_H = 110, 120
COLS = 15


def font(size):
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def load(b64):
    im = Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGBA")
    white = Image.new("RGBA", im.size, (255, 255, 255, 255))
    return Image.alpha_composite(white, im).convert("RGB")


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "friend_seg.json"
    d = json.load(open(path, encoding="utf-8"))
    blobs, sizes = d["blobs"], d["row_sizes"]
    f_big, f_small, f_head = font(18), font(14), font(20)

    rows, i = [], 0
    for n in sizes:
        rows.append(blobs[i:i + n])
        i += n
    if i < len(blobs):
        rows.append(blobs[i:])

    head_h = 30
    sheet_h = sum(head_h + ((len(r) + COLS - 1) // COLS) * CELL_H + 10 for r in rows)
    img = Image.new("RGB", (COLS * CELL_W, sheet_h), (255, 255, 255))
    dr = ImageDraw.Draw(img)

    y, gi = 0, 0
    for ri, row in enumerate(rows):
        want = EXPECTED_SIZES[ri] if ri < len(EXPECTED_SIZES) else None
        bad = want is not None and len(row) != want
        dr.rectangle([0, y, img.width, y + head_h - 4], fill=(255, 225, 225) if bad else (225, 240, 225))
        dr.text((8, y + 4), f"row {ri + 1}: mile {len(row)} / chahiye {want}", fill=(160, 0, 0) if bad else (0, 90, 0), font=f_head)
        y += head_h
        exp = EXPECTED_ROWS[ri] if ri < len(EXPECTED_ROWS) else None
        for k, b64 in enumerate(row):
            cx, cy = (k % COLS) * CELL_W, y + (k // COLS) * CELL_H
            dr.rectangle([cx, cy, cx + CELL_W - 1, cy + CELL_H - 1], outline=(210, 210, 210))
            try:
                g = load(b64)
                s = min((CELL_W - 16) / g.width, (CELL_H - 50) / g.height, 3.0)
                g = g.resize((max(1, round(g.width * s)), max(1, round(g.height * s))), Image.LANCZOS)
                img.paste(g, (cx + (CELL_W - g.width) // 2, cy + 22 + (CELL_H - 50 - g.height) // 2))
            except Exception:
                dr.text((cx + 8, cy + 40), "?", fill=(200, 0, 0), font=f_big)
            dr.text((cx + 4, cy + 2), f"#{gi + 1}", fill=(0, 0, 160), font=f_small)
            if exp and k < len(exp):
                dr.text((cx + 4, cy + CELL_H - 22), f"hona: {exp[k]}", fill=(120, 120, 120), font=f_small)
            elif exp is None:
                dr.text((cx + 4, cy + CELL_H - 22), f"pos {k + 1}", fill=(120, 120, 120), font=f_small)
            else:
                dr.text((cx + 4, cy + CELL_H - 22), "EXTRA", fill=(200, 0, 0), font=f_small)
            gi += 1
        y += ((len(row) + COLS - 1) // COLS) * CELL_H + 10

    img.save("blob_sheet.png")
    print("saved blob_sheet.png", img.size)


if __name__ == "__main__":
    main()