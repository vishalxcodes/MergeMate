r"""
row_debug.py - dikhata hai kaunse tukde jude (kis rule se) aur lines kaise banti hain (apni asli pipeline ke saath).

Run:  venv\Scripts\python.exe row_debug.py friend2.jpg
"""
import sys

import hw_segmenter as S

S.DEBUG_LOG = []

from app import app  # noqa: E402

img = sys.argv[1] if len(sys.argv) > 1 else "friend2.jpg"
with open(img, "rb") as f:
    r = app.test_client().post("/segment-handwriting", data={"file": (f, img)}, content_type="multipart/form-data")
d = r.get_json() or {}
merges = [e for e in S.DEBUG_LOG if e[0] in ("stacked", "side", "tail")]
print(f"\n=== joins: {len(merges)} ===")
for e in merges:
    print(f"  {e[0]:8s} A={e[1]}  +  B={e[2]}")
print("\n=== line grouping ===")
for e in S.DEBUG_LOG:
    if e[0] == "order":
        print("  ", *e[1:])
print("\nresult:", d.get("detected_count"), "/", d.get("expected_count"), d.get("row_sizes"))