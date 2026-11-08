"""
mem_stages.py - WHICH step of the generation eats the memory?

  venv\\Scripts\\python.exe mem_stages.py 3000            (Raj's glyphs, about 3 pages)
  venv\\Scripts\\python.exe mem_stages.py 3000 writers\\yash

It runs the same generation as the server and measures, for every step, how far the memory of the whole process
climbs while that step runs.  Send the printed table back.
"""
import os
import sys
import threading
import time

import psutil

from mem_test import make_text

STAGES = ["render_pages", "make_paper", "composite", "camera_effect", "_to_jpeg_bytes", "_pdf_from_jpegs"]
MB = 1048576.0


class Sampler:
    def __init__(self):
        self.proc = psutil.Process(os.getpid())
        self.peak = self.rss()
        self.stop = threading.Event()
        self.thread = threading.Thread(target=self.run, daemon=True)
        self.thread.start()

    def rss(self):
        return self.proc.memory_info().rss

    def run(self):
        while not self.stop.is_set():
            r = self.rss()
            if r > self.peak:
                self.peak = r
            time.sleep(0.01)

    def reset(self):
        self.peak = self.rss()


def instrument(G, sampler):
    stats = {name: [] for name in STAGES}
    for name in STAGES:
        orig = getattr(G, name, None)
        if orig is None:
            continue

        def make(name, orig):
            def wrapped(*a, **k):
                before = sampler.rss()
                sampler.reset()
                t = time.time()
                out = orig(*a, **k)
                stats[name].append((before, max(sampler.peak, sampler.rss()), sampler.rss(), time.time() - t))
                return out
            return wrapped

        setattr(G, name, make(name, orig))
    return stats


def report(stats, total_peak, base):
    print()
    print(f"{'step':16s} {'calls':>5s} {'before MB':>10s} {'peak MB':>9s} {'CLIMB MB':>9s} {'left over MB':>13s} {'sec/call':>9s}")
    for name in STAGES:
        rows = stats.get(name) or []
        if not rows:
            continue
        before = max(r[0] for r in rows) / MB
        peak = max(r[1] for r in rows) / MB
        climb = max((r[1] - r[0]) for r in rows) / MB
        left = max((r[2] - r[0]) for r in rows) / MB
        sec = sum(r[3] for r in rows) / len(rows)
        print(f"{name:16s} {len(rows):5d} {before:10.0f} {peak:9.0f} {climb:9.0f} {left:13.0f} {sec:9.2f}")
    print(f"\nprocess: {base / MB:.0f} MB before -> {total_peak / MB:.0f} MB peak")
    print("CLIMB = how much that single step adds while it runs;  left over = what it keeps afterwards")


def main():
    chars = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    folder = sys.argv[2] if len(sys.argv) > 2 else os.path.join("writers", "raj")
    import hw_generate as G

    glyphs = G.load_dev_glyphs(folder)
    text = make_text(chars)
    sampler = Sampler()
    stats = instrument(G, sampler)
    base = sampler.rss()
    sampler.reset()
    pdf, info = G.generate_pdf(text, glyphs)
    total_peak = max(sampler.peak, sampler.rss())
    sampler.stop.set()
    print(f"text: {len(text)} characters -> {info.get('page_count')} pages, pdf {len(pdf) / 1e6:.1f} MB")
    report(stats, total_peak, base)


if __name__ == "__main__":
    main()