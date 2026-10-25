import glob
import json
import os
import sys
import time

from hw_parser import parse
from hw_renderer import render_pages, pages_to_pdf_bytes, DPI, DEFAULT_CFG, normalize_glyph_sheet, MM
from hw_paper import make_paper, composite, camera_effect

# ---- choose the look here -------------------------------------------------
TONE = "photo"      # "photo" (like your dim bluish photos), "bright", "white", "cream"
STYLE = "plain"     # "plain" (like your sheets) or "ruled"
PHOTO_EFFECT = True # tilt, softness, noise, jpeg
PEN_BOOST = 1.1     # pen thickness vs calibration glyphs. 1.0 = patli (PDF jaisi), 1.7 = purani moti pen. Dark lage to kam karo
BLACK = (26, 26, 38)        # black pen ka rang (thoda soft; pehle (14, 14, 22) tha)
SLANT_DEG = 10       # letters ko seedhe ke bajaye daayein jhukao (degrees). Dost ki asli writing jhuki hui hai: 8 se 12 try karo. 0 = pehle jaisa
EXTRA_CFG = {"clean_dots": True}      # koi bhi renderer setting yahan override karo. {} = kuch nahi badalta (aapki apni writing jaisi hi rahegi)
# Krish ki original photo se naapi hui style (mini experiment) - uncomment karke try karo:
# EXTRA_CFG = {"line_height": 9.5 * MM, "x_height": 2.8 * MM}      # original ki lines kaafi tight hain (line spacing = lagbhag 2.7 x letter height)
BLACK_LEADINS = True        # bullets ka "Grouping similar data:" jaisa sub-heading black pen mein
# ---------------------------------------------------------------------------


import re


def blacken_leadins(parsed, max_len=45):
    """Bullet lines jaise "- Grouping similar data: To put ..." mein ':' tak ka sub-heading black kar deta hai.
    Parser ke spans (text, colour) ko hi badalta hai; underline/circle suffix (jaise ':u1') bacha rehta hai."""
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


stamp = time.strftime("%H%M%S")

# bad_samples.json (optional):
#   {"s": ["seg2.json"], "r": ["seg2.json"]}            -> us sheet ka us letter ka sample use nahi hoga
#   {"_swap": {"seg2.json": [["s", "8"]]}}               -> us sheet mein s aur 8 ke labels aapas mein badal do
# (glyph_audit.py se dekho kaun sa kharab hai ya kaun sa label ulta hai)
bad = {}
if os.path.exists("bad_samples.json"):
    bad = json.load(open("bad_samples.json", encoding="utf-8"))

seg_files = sys.argv[1:] or sorted(glob.glob("seg*.json"))   # python test_render.py friend_seg_fixed.json  -> sirf wahi file
pool = {}                                   # char -> [(sheet file, base64), ...]
for fpath in seg_files:
    sheet = normalize_glyph_sheet(json.load(open(fpath, encoding="utf-8"))["glyphs"])   # same letter size for every sheet
    for a, b in bad.get("_swap", {}).get(fpath, []):          # galat label wale jode (jaise s <-> 8) theek karo
        if a in sheet and b in sheet:
            sheet[a], sheet[b] = sheet[b], sheet[a]
            print(f"swapped {a!r} <-> {b!r} in {fpath}")
    for ch, b64 in sheet.items():
        pool.setdefault(ch, []).append((fpath, b64))

glyphs = {}
for ch, items in pool.items():
    keep = [(f, b) for f, b in items if f not in bad.get(ch, [])]
    if not keep:                            # sab kharab mark hain -> kuch to chahiye, sab rakh lo
        print(f"warning: {ch!r}: saare samples bad mark hain, filter ignore kiya")
        keep = items
    elif len(keep) < len(items):
        print(f"dropped {ch!r}:", [f for f, _ in items if (f, _) not in keep])
    glyphs[ch] = [b for _, b in keep]
print("calibration sheets:", seg_files)

text = """## Name: Vishal Yadav || <uu>Tutorial</uu> - 4
[t] ## Course: Diploma
[t] ## CU240860110

## <o>1</o>. Define cluster analysis and explain its objectives
<uu>A</uu> Cluster analysis is a statistical technique used to group similar objects, people, or data into different cluster. object within the same cluster are more similar to each other than to object in other cluster.
## objectives -
- Grouping similar data: To put similar items or observation into the same group.
- Finding patterns: To discover hidden patterns or relation-ships in data
- Understanding data: To make large and complex dataset easier to understand.
- Market segmentation: To divide customer into groups based on similar needs, preference or behaviour.
- Decision Making: To help organization make better decision based on different groups or segments.
## <o>2</o>. Explain the structure and working of a decision Tree."""

parsed = parse(text)
if BLACK_LEADINS:
    parsed = blacken_leadins(parsed)

pages, info = render_pages(glyphs, parsed, seed=1,
                           cfg={"ruled": STYLE == "ruled", "pen_boost": PEN_BOOST, "black": BLACK, "slant_deg": SLANT_DEG, **EXTRA_CFG})

final = []
for i, flat in enumerate(pages):
    paper = make_paper(
        flat.width, flat.height, style=STYLE, tone=TONE, seed=10 + i, dpi=DPI,
        ruled={"line_height": info["line_height"], "base0": info["base0"],
               "margin_x": info["margin_left"] - 4 * (DPI / 25.4)},
    )
    img = composite(flat, paper, seed=20 + i)
    if PHOTO_EFFECT:
        img = camera_effect(img, seed=30 + i)
    img.save(f"result_{stamp}_{i + 1}.png")
    final.append(img)

open(f"result_{stamp}.pdf", "wb").write(pages_to_pdf_bytes(final))
print("done | pages:", info["page_count"], "| skipped chars:", info["skipped"])
print("first page saved as:", os.path.abspath(f"result_{stamp}_1.png"))