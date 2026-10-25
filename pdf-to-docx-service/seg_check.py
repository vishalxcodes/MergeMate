r"""
seg_check.py - kai sheet photos ko Flask service se segment karwake count dikhata hai (regression check).

Pehle Python service chalu rakho (start_flask.bat), phir kisi bhi Python se:
    python seg_check.py abc2.jpg abc3.jpg friend2.jpg
Har photo ke liye: success, kitne blobs mile / kitne chahiye, aur row-wise count.
Sahi row_sizes aise hone chahiye: [12, 12, 2, 12, 12, 2, 10, 7]
"""
import json
import subprocess
import sys

URL = "http://localhost:5000/segment-handwriting"
WANT = [12, 12, 2, 12, 12, 2, 10, 7]


def main():
    files = sys.argv[1:]
    if not files:
        print("use: python seg_check.py photo1.jpg photo2.jpg ...")
        return
    for f in files:
        try:
            out = subprocess.run(["curl.exe", "-s", "-X", "POST", "-F", f"file=@{f}", URL],
                                 capture_output=True, text=True, timeout=300).stdout
            d = json.loads(out)
        except Exception as e:
            print(f"{f}: ERROR {e}")
            continue
        rs = d.get("row_sizes")
        print(f"{f}: success={d.get('success')} blobs={d.get('detected_count')}/{d.get('expected_count')} rows={rs}"
              + ("" if rs == WANT else "   <-- row sizes alag"))


if __name__ == "__main__":
    main()