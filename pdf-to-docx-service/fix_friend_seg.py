r"""
fix_friend_seg.py - dost ki friend3 sheet ki do galtiyan theek karke render ke liye file banata hai (SIRF TEST ke liye).

  1. 'Y' ke baad ka extra dot hata deta hai (row 6 mein 3 blobs: Y . Z)
  2. '0' nahi likha gaya tha -> test ke liye us ka capital 'O' wala glyph '0' bana deta hai

Run (kisi bhi Python se, sirf json chahiye):
    python fix_friend_seg.py friend_seg.json friend_seg_fixed.json
Output: friend_seg_fixed.json  (seg.json jaisa format: {"glyphs": {...}})
"""
import json
import sys

ROW_SIZES_NOW = [12, 12, 2, 12, 12, 3, 9, 7]
LABELS = (list("abcdefghijklmnopqrstuvwxyz") + list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
          + list("0123456789") + list(".,?!'\"-"))


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "friend_seg.json"
    dst = sys.argv[2] if len(sys.argv) > 2 else "friend_seg_fixed.json"
    d = json.load(open(src, encoding="utf-8"))
    if d.get("row_sizes") != ROW_SIZES_NOW:
        print("ruk gaya: row_sizes", d.get("row_sizes"), "hain, par", ROW_SIZES_NOW, "chahiye the (friend3.jpg se banayi file?)")
        return
    glyphs = d["glyphs"]
    if any(ch not in glyphs for ch in LABELS):
        print("ruk gaya: glyphs mein saare 69 labels nahi hain")
        return

    seq = [glyphs[ch] for ch in LABELS]            # reading order (labels order mein bane the)
    dot_idx = 12 + 12 + 2 + 12 + 12 + 1            # row 6 ka beech wala (Y . Z)
    del seq[dot_idx]                               # extra dot hata do  -> 68 glyphs
    o_cap = seq[12 + 12 + 2 + 12 + 2]              # row 5 ka teesra = capital 'O'
    digits_start = 12 + 12 + 2 + 12 + 12 + 2       # row 7 ki shuruaat
    seq.insert(digits_start, o_cap)                # '0' ki jagah capital O (sirf test) -> 69 glyphs

    fixed = dict(zip(LABELS, seq))
    json.dump({"glyphs": fixed}, open(dst, "w", encoding="utf-8"))
    print(f"ok: {len(fixed)} glyphs -> {dst}   (extra dot hata diya, '0' = capital O)")


if __name__ == "__main__":
    main()