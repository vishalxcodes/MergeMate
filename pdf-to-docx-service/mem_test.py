"""
mem_test.py - how much memory / time does ONE long generation need?  (runs on your PC, same code as the server)

  venv\\Scripts\\pip.exe install psutil          (once)
  venv\\Scripts\\python.exe mem_test.py 5800      -> text of about 5800 characters, Raj's glyphs (writers\\raj)
  venv\\Scripts\\python.exe mem_test.py 6000 writers\\yash

Prints pages, seconds and the PEAK memory of the whole process.  Render's free instance has 512 MB in total and
gives about 1/3 of this PC's speed, so read the numbers like this:
  peak_mb  > 400      -> too big for the free instance (the worker gets killed: SIGKILL)
  seconds  > 40       -> probably more than 120 s on Render (Node cuts the request after 120 s)
"""
import os
import sys
import threading
import time

import psutil

PARA = (
    "## Q-1 Define cluster analysis and explain its objectives\n"
    "Ans A cluster analysis is a statistical technique used to group similar objects, people, or data into "
    "different clusters. Objects within the same cluster are more similar to each other than to objects in "
    "other clusters.\n"
    "Objectives -\n"
    "- Grouping similar data: To put similar items or observations into the same group.\n"
    "- Finding patterns: To discover hidden patterns or relationships in data.\n"
    "- Market segmentation: To divide customers into groups based on similar needs, preference or behaviour.\n"
    "- Decision making: To help organizations make better decisions based on different groups or segments.\n\n"
)


def make_text(chars):
    text = ""
    while len(text) < chars:
        text += PARA
    return text[:chars]


def measure(generate, text, glyphs):
    """Runs generate(text, glyphs) while a thread samples the memory of this process 20x per second."""
    proc = psutil.Process(os.getpid())
    peak = [proc.memory_info().rss]
    stop = threading.Event()

    def sample():
        while not stop.is_set():
            peak[0] = max(peak[0], proc.memory_info().rss)
            time.sleep(0.05)

    base = proc.memory_info().rss
    t = threading.Thread(target=sample, daemon=True)
    t.start()
    started = time.time()
    try:
        pdf, info = generate(text, glyphs)
    finally:
        stop.set()
        t.join()
    return {
        "pdf": pdf,
        "pages": info.get("page_count"),
        "seconds": time.time() - started,
        "base_mb": base / 1048576.0,
        "peak_mb": peak[0] / 1048576.0,
    }


def main():
    chars = int(sys.argv[1]) if len(sys.argv) > 1 else 5800
    folder = sys.argv[2] if len(sys.argv) > 2 else os.path.join("writers", "raj")
    import hw_generate as G

    glyphs = G.load_dev_glyphs(folder)
    text = make_text(chars)
    print(f"text: {len(text)} characters | glyphs from: {folder}")
    r = measure(lambda t, g: G.generate_pdf(t, g), text, glyphs)
    with open("mem_test_out.pdf", "wb") as f:
        f.write(r["pdf"])
    print(f"pages        : {r['pages']}")
    print(f"seconds      : {r['seconds']:.1f}   (Render free is roughly 3x slower)")
    print(f"memory before: {r['base_mb']:.0f} MB")
    print(f"memory PEAK  : {r['peak_mb']:.0f} MB   (Render free limit: 512 MB for everything)")
    print(f"pdf size     : {len(r['pdf']) / 1e6:.1f} MB  -> mem_test_out.pdf")


if __name__ == "__main__":
    main()