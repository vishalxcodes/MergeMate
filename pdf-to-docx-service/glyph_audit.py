"""
glyph_audit.py - dekho har letter ke saare samples (seg*.json) ek contact sheet mein.

Run:  python glyph_audit.py
Out : glyph_audit_1.png, glyph_audit_2.png ...  (har cell: letter + har sheet ka sample, neeche sheet ka naam)
      + terminal mein capitals ka height report (V jaise chhote capitals flag hote hain)

Jo sample kharab dikhe (jaise abc2 ka 's' jo '8' jaisa hai) use bad_samples.json mein daalo:
    {"s": ["seg2.json"], "r": ["seg2.json"]}
test_render.py us sheet ka us letter ka sample hata dega (agar us letter ka koi aur sample bacha ho).
"""
import glob
import json

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from hw_renderer import normalize_glyph_sheet, _decode_mask, CAP_CHARS, X_HEIGHT_CHARS

SLOT_W, SLOT_H = 120, 110      # ek sample ka box
COLS = 6                       # ek row mein kitne letters
PER_IMAGE = 36                 # ek PNG mein kitne letters


def font(size):
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def main():
    files = sorted(glob.glob("seg*.json"))
    if not files:
        print("seg*.json nahi mila")
        return
    sheets = {}
    for f in files:
        sheets[f] = normalize_glyph_sheet(json.load(open(f, encoding="utf-8"))["glyphs"])

    # ---- capitals report (normalize ke baad) -----------------------------------------------------------
    print("\nCapital height / x-height  (normalize ke baad; 1.0 = small letter jitna)")
    for f, sh in sheets.items():
        xs = [_decode_mask(sh[c]).height for c in X_HEIGHT_CHARS if c in sh]
        xh = float(np.median(xs)) if xs else 1.0
        row = []
        for c in CAP_CHARS:
            if c in sh:
                row.append(f"{c}:{_decode_mask(sh[c]).height / xh:.2f}")
        print(f"  {f}: " + "  ".join(row))

    chars = sorted(set(c for sh in sheets.values() for c in sh))
    f_big, f_small = font(22), font(13)
    cell_w = SLOT_W * len(files)
    cell_h = SLOT_H + 44

    for part, start in enumerate(range(0, len(chars), PER_IMAGE), 1):
        chunk = chars[start:start + PER_IMAGE]
        rows = (len(chunk) + COLS - 1) // COLS
        img = Image.new("RGB", (COLS * cell_w, rows * cell_h), (255, 255, 255))
        d = ImageDraw.Draw(img)
        for i, ch in enumerate(chunk):
            cx, cy = (i % COLS) * cell_w, (i // COLS) * cell_h
            d.rectangle([cx, cy, cx + cell_w - 1, cy + cell_h - 1], outline=(200, 200, 200))
            d.text((cx + 6, cy + 4), repr(ch), fill=(200, 0, 0), font=f_big)
            for j, f in enumerate(files):
                sx = cx + j * SLOT_W
                if j:
                    d.line([sx, cy, sx, cy + cell_h], fill=(225, 225, 225))
                b64 = sheets[f].get(ch)
                if b64:
                    m = _decode_mask(b64)
                    k = min(1.0, (SLOT_W - 12) / m.width, (SLOT_H - 20) / m.height)
                    if k < 1.0:
                        m = m.resize((max(1, round(m.width * k)), max(1, round(m.height * k))), Image.LANCZOS)
                    img.paste((15, 20, 120), (sx + (SLOT_W - m.width) // 2, cy + 30 + (SLOT_H - 20 - m.height)), m)
                d.text((sx + 6, cy + cell_h - 18), f, fill=(90, 90, 90), font=f_small)
        out = f"glyph_audit_{part}.png"
        img.save(out)
        print("saved", out, "->", "".join(chunk))


if __name__ == "__main__":
    main()