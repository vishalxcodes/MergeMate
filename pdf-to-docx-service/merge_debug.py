r"""
merge_debug.py - dikhata hai ki segmenter ne kaunse tukdon ko jodne ki koshish ki aur kaunse chhod diye (apni asli pipeline ke saath).

Run (venv ke python se; Flask chalu ho ya band, dono chalega):
    venv\Scripts\python.exe merge_debug.py friend2.jpg

Har candidate jode ke liye:
    ov     = horizontal overlap (chhote tukde ka kitna hissa; minus matlab side-by-side)   rule: >= 0.60
    gap    = vertical gap / typical letter height                                          rule: <= 0.12
    joined = jode ki height / typical letter height                                        rule: <= 1.60
"""
import sys

import hw_segmenter as S

_orig = S._merge_stacked_parts


def _verbose(comps, **kw):
    hs = sorted(c["y1"] - c["y0"] + 1 for c in comps if not c.get("tiny"))
    href = hs[len(hs) // 2]
    print(f"\n[debug] components: {len(comps)}  typical height: {href}")
    h = lambda c: c["y1"] - c["y0"] + 1
    w = lambda c: c["x1"] - c["x0"] + 1
    rows = []
    for i in range(len(comps)):
        for j in range(i + 1, len(comps)):
            a, b = comps[i], comps[j]
            ov = (min(a["x1"], b["x1"]) - max(a["x0"], b["x0"]) + 1) / max(1, min(w(a), w(b)))
            gap = max(a["y0"] - b["y1"], b["y0"] - a["y1"], 0) / href
            joined = (max(a["y1"], b["y1"]) - min(a["y0"], b["y0"]) + 1) / href
            fragment = min(h(a), h(b)) <= 0.7 * href or min(w(a), w(b)) <= 0.7 * href
            if ov >= -0.5 and gap <= 0.5 and fragment:
                ok = ov >= 0.6 and gap <= 0.12 and joined <= 1.6
                rows.append((gap, -ov, joined, ok, ov, a, b))
    rows.sort(key=lambda r: (r[0], r[1]))
    print("  (y bada = page mein neeche; digits wali row sabse neeche ke paas hogi)")
    for gap, _, joined, ok, ov, a, b in rows[:45]:
        print(f"  {'MERGE' if ok else 'no   '}  ov={ov:5.2f}  gap={gap:4.2f}  joined={joined:4.2f}   "
              f"A=({a['x0']},{a['y0']})-({a['x1']},{a['y1']})  B=({b['x0']},{b['y0']})-({b['x1']},{b['y1']})")
    return _orig(comps, **kw)


S._merge_stacked_parts = _verbose

from app import app  # noqa: E402  (imports the same pipeline the website uses)

img = sys.argv[1] if len(sys.argv) > 1 else "friend2.jpg"
with open(img, "rb") as f:
    r = app.test_client().post("/segment-handwriting", data={"file": (f, img)}, content_type="multipart/form-data")
d = r.get_json() or {}
print("\nresult:", d.get("detected_count"), "/", d.get("expected_count"), d.get("row_sizes"))