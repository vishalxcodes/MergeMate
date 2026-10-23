"""
hw_segmenter.py  -  glyph segmentation for the handwriting calibration sheet.

  1. find separate pen-stroke components (no vertical bridging),
  2. drop photo junk: thin strips on the photo border, and anything far away from the writing,
  3. attach only small dot-like marks (i, j, ?, ! dots, quote ticks) to their letter,
  3b. join stacked fragments of one letter (bar of a 5 / 7 / t / f, the stroke through a $-style S),
  3c. NEW: join small side fragments and detached tails (hump of an h, tail of a Q, lower loop of an f / k),
  4. estimate the page tilt, group glyphs into lines by their vertical centre,
  5. sort lines top -> bottom and glyphs left -> right.

orientation_score() tells how plausible a segmentation is for the calibration sheet, so the
caller can try the photo upright / rotated and keep the best one.
"""
import cv2
import numpy as np

EXPECTED_LINES = 8        # the calibration sheet has 8 lines (see _EXPECTED_ROWS in the caller: 12,12,2,12,12,2,10,7)
DEBUG_LOG = None          # row_debug.py sets this to a list to see which pieces were joined and how lines were split


def _log(*item):
    if DEBUG_LOG is not None:
        DEBUG_LOG.append(item)


def _bbox(c):
    return (c["x0"], c["y0"], c["x1"], c["y1"])


def _ink_and_background(binary):
    b = binary if binary.ndim == 2 else cv2.cvtColor(binary, cv2.COLOR_BGR2GRAY)
    white_ink = float((b > 127).mean()) < 0.5          # ink is always the minority colour
    ink = ((b > 127) if white_ink else (b <= 127)).astype(np.uint8) * 255
    bg_value = 0 if white_ink else 255
    return b, ink, bg_value


def _stroke_components(ink, scale, min_area):
    kx = 2 * max(1, round(2.0 * scale)) + 1
    ky = 2 * max(1, round(1.0 * scale)) + 1
    closed = cv2.dilate(ink, cv2.getStructuringElement(cv2.MORPH_RECT, (kx, ky)))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(closed, connectivity=8)
    H, W = ink.shape
    edge = 3
    tiny_area = max(6, int(3 * scale * scale))
    comps = []
    for i in range(1, n):
        x, y, w, h, _ = stats[i]
        sel = (lab[y:y + h, x:x + w] == i) & (ink[y:y + h, x:x + w] > 0)
        ys, xs = np.where(sel)
        area = len(xs)
        if area < tiny_area:
            continue
        tiny = area < min_area
        x0, x1, y0, y1 = int(xs.min() + x), int(xs.max() + x), int(ys.min() + y), int(ys.max() + y)
        bw, bh = x1 - x0 + 1, y1 - y0 + 1
        touches_border = x0 <= edge or y0 <= edge or x1 >= W - 1 - edge or y1 >= H - 1 - edge
        if touches_border:
            # junk along the border of the photo (paper edge, shadows, the book under the sheet):
            # very big, or long and thin.  A real letter that merely touches the edge is kept.
            if bw > 0.15 * W or bh > 0.15 * H or max(bw, bh) > 4 * max(1, min(bw, bh)):
                continue
        comps.append({"x0": x0, "x1": x1, "y0": y0, "y1": y1, "area": int(area), "ids": {i}, "tiny": tiny})
    return comps, lab


def _keep_main_cluster(comps):
    """The writing is one compact group.  Photo junk (carpet pattern, book edge) forms separate
    groups far away from it, so keep only the biggest group of neighbouring components."""
    if len(comps) < 8:
        return comps
    big = [c for c in comps if not c["tiny"]] or comps
    href = float(np.median([c["y1"] - c["y0"] + 1 for c in big]))
    reach = 5.0 * href
    cx = np.array([(c["x0"] + c["x1"]) / 2.0 for c in comps])
    cy = np.array([(c["y0"] + c["y1"]) / 2.0 for c in comps])
    parent = list(range(len(comps)))

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    for i in range(len(comps)):
        near = np.where((cx - cx[i]) ** 2 + (cy - cy[i]) ** 2 <= reach ** 2)[0]
        for j in near:
            ri, rj = find(i), find(int(j))
            if ri != rj:
                parent[ri] = rj
    groups = {}
    for i in range(len(comps)):
        groups.setdefault(find(i), []).append(i)
    best = max(groups.values(), key=len)
    return [comps[i] for i in best]


def _merge(a, b):
    return {
        "x0": min(a["x0"], b["x0"]), "x1": max(a["x1"], b["x1"]),
        "y0": min(a["y0"], b["y0"]), "y1": max(a["y1"], b["y1"]),
        "area": a["area"] + b["area"], "ids": a["ids"] | b["ids"], "tiny": False,
    }


def _attach_dots(comps):
    h = lambda c: c["y1"] - c["y0"] + 1
    w = lambda c: c["x1"] - c["x0"] + 1
    href = float(np.median([h(c) for c in comps if not c.get("tiny")]))
    dots = [c for c in comps if h(c) <= 0.45 * href and w(c) <= 0.8 * href]
    big = [c for c in comps if all(c is not d for d in dots)]
    leftover = []
    for d in dots:
        dcx = (d["x0"] + d["x1"]) / 2
        best, best_gap = None, 1e9
        for k, b in enumerate(big):
            if not (b["x0"] - 0.25 * href <= dcx <= b["x1"] + 0.25 * href):
                continue
            gap = max(b["y0"] - d["y1"], d["y0"] - b["y1"], 0)
            max_gap = (0.7 if d.get("tiny") else 0.8) * href
            if gap <= max_gap and gap < best_gap:
                best, best_gap = k, gap
        if best is not None:
            big[best] = _merge(big[best], d)
        else:
            leftover.append(d)
    leftover = [d for d in leftover if not d.get("tiny")]
    leftover.sort(key=lambda c: c["x0"])
    tidy = []
    for d in leftover:                      # e.g. the two ticks of the " character
        if tidy:
            p = tidy[-1]
            hgap = d["x0"] - p["x1"]
            dy = abs((d["y0"] + d["y1"]) / 2 - (p["y0"] + p["y1"]) / 2)
            if hgap <= 0.32 * href and dy <= 0.35 * href:
                tidy[-1] = _merge(p, d)
                continue
        tidy.append(d)
    return big + tidy


def _merge_close_ticks(comps):
    href = float(np.median([c["y1"] - c["y0"] + 1 for c in comps]))
    is_small = lambda c: (c["y1"] - c["y0"] + 1) <= 0.7 * href and (c["x1"] - c["x0"] + 1) <= 0.35 * href
    changed = True
    while changed:
        changed = False
        for i in range(len(comps)):
            for j in range(i + 1, len(comps)):
                a, b = comps[i], comps[j]
                if not (is_small(a) and is_small(b)):
                    continue
                hgap = max(a["x0"], b["x0"]) - min(a["x1"], b["x1"])
                dy = abs((a["y0"] + a["y1"]) / 2 - (b["y0"] + b["y1"]) / 2)
                if hgap <= 0.5 * href and dy <= 0.35 * href:
                    comps[i] = _merge(a, b)
                    del comps[j]
                    changed = True
                    break
            if changed:
                break
    return comps


def _merge_stacked_parts(comps, min_overlap=0.6, max_vgap=0.12, max_joined=1.6):
    """GENERAL rule for letters that were written in two separate strokes which do not touch:
    the bar of a 5 / 7 / t / f / 4, the vertical stroke through a $-style S, a detached top of a Q ...

    Two components are parts of ONE letter when
      - they overlap horizontally by at least `min_overlap` of the NARROWER one (they sit on top of each other,
        not next to each other, so neighbouring letters are never joined),
      - the vertical gap between them is tiny (<= max_vgap * typical height), and
      - the joined shape is not taller than `max_joined` x the typical letter height, which rejects a pile-up
        of several letters from different lines (two halves of one S are ~1.2x, a whole letter above another is 2x+).
    """
    if len(comps) < 3:
        return comps
    hs = [c["y1"] - c["y0"] + 1 for c in comps if not c.get("tiny")]
    if not hs:
        return comps
    href = float(np.median(hs))
    h = lambda c: c["y1"] - c["y0"] + 1
    w = lambda c: c["x1"] - c["x0"] + 1

    changed = True
    while changed:
        changed = False
        for i in range(len(comps)):
            for j in range(i + 1, len(comps)):
                a, b = comps[i], comps[j]
                ov = min(a["x1"], b["x1"]) - max(a["x0"], b["x0"]) + 1
                if ov < min_overlap * min(w(a), w(b)):
                    continue
                vgap = max(a["y0"] - b["y1"], b["y0"] - a["y1"], 0)
                if vgap > max_vgap * href:
                    continue
                joined_h = max(a["y1"], b["y1"]) - min(a["y0"], b["y0"]) + 1
                if joined_h > max_joined * href:
                    continue
                _log("stacked", _bbox(a), _bbox(b))
                comps[i] = _merge(a, b)
                del comps[j]
                changed = True
                break
            if changed:
                break
    return comps


def _merge_fragments(comps, side_gap=0.2, tail_gap=0.7):
    """Small pieces of a letter that were written detached.  Two GENERAL rules, both only for a SMALL piece b
    next to a bigger piece a (b has to be clearly smaller, so two whole letters are never joined):

      side fragment : b is very narrow (<= 0.4 x typical height), lies inside a's vertical span and (almost) touches
                      a's side (gap <= side_gap x typical height)       -> hump of an h, tail of a Q
      detached tail : a is a tall letter (>= 1.4 x typical height), b sits right above / below it, overlapping it
                      horizontally by >= 60 % and the vertical gap is <= tail_gap x typical height,
                      b is at most half the size of a                  -> lower loop of an f / k

    The bottom line of the sheet (full stops, commas ...) is left alone: its marks really are separate symbols.
    """
    if len(comps) < 3:
        return comps
    hs = [c["y1"] - c["y0"] + 1 for c in comps if not c.get("tiny")]
    if not hs:
        return comps
    href = float(np.median(hs))
    h = lambda c: c["y1"] - c["y0"] + 1
    w = lambda c: c["x1"] - c["x0"] + 1
    area = lambda c: w(c) * h(c)
    last_line_y = max((c["y0"] + c["y1"]) / 2.0 for c in comps) - 1.2 * href
    in_last_line = lambda c: (c["y0"] + c["y1"]) / 2.0 > last_line_y

    changed = True
    while changed:
        changed = False
        for i in range(len(comps)):
            for j in range(len(comps)):
                if i == j:
                    continue
                a, b = comps[i], comps[j]                    # a = bigger piece, b = candidate small piece
                if in_last_line(a) or in_last_line(b) or area(b) >= area(a):
                    continue
                joined_h = max(a["y1"], b["y1"]) - min(a["y0"], b["y0"]) + 1
                # side fragment
                v_in = (min(a["y1"], b["y1"]) - max(a["y0"], b["y0"]) + 1) / float(h(b))
                hgap = max(0, max(a["x0"], b["x0"]) - min(a["x1"], b["x1"]) - 1)
                side = v_in >= 0.8 and hgap <= side_gap * href and w(b) <= 0.4 * href and area(b) <= 0.2 * area(a)
                # detached tail
                ov = (min(a["x1"], b["x1"]) - max(a["x0"], b["x0"]) + 1) / float(min(w(a), w(b)))
                vgap = max(a["y0"] - b["y1"], b["y0"] - a["y1"], 0)
                tail = (ov >= 0.6 and vgap <= tail_gap * href and h(a) >= 1.4 * href
                        and area(b) <= 0.5 * area(a) and joined_h <= 3.2 * href)
                if side or tail:
                    _log("side" if side else "tail", _bbox(a), _bbox(b))
                    comps[i] = _merge(a, b)
                    del comps[j]
                    changed = True
                    break
            if changed:
                break
    return comps


def _estimate_skew_deg(comps):
    cx = np.array([(c["x0"] + c["x1"]) / 2 for c in comps])
    cy = np.array([(c["y0"] + c["y1"]) / 2 for c in comps])
    mh = float(np.median([c["y1"] - c["y0"] + 1 for c in comps]))
    best, best_angle = -1.0, 0.0
    for a in np.arange(-4.0, 4.01, 0.1):
        t = np.deg2rad(a)
        yy = cy * np.cos(t) - cx * np.sin(t)
        bins = int((yy.max() - yy.min()) / (mh / 4)) + 1
        hist, _ = np.histogram(yy, bins=max(bins, 2))
        score = float((hist.astype(float) ** 2).sum())
        if score > best:
            best, best_angle = score, float(a)
    return best_angle


def _order(comps, expected_lines=None):
    t = np.deg2rad(_estimate_skew_deg(comps))
    for c in comps:
        x, y = (c["x0"] + c["x1"]) / 2, (c["y0"] + c["y1"]) / 2
        c["rx"] = x * np.cos(t) + y * np.sin(t)
        c["ry"] = y * np.cos(t) - x * np.sin(t)
    mh = float(np.median([c["y1"] - c["y0"] + 1 for c in comps]))
    by_y = sorted(comps, key=lambda c: c["ry"])
    if DEBUG_LOG is not None:
        jumps = sorted(((b["ry"] - a["ry"], round(a["ry"]), round(b["ry"])) for a, b in zip(by_y, by_y[1:])), reverse=True)[:10]
        _log("order", "skew_deg=%.1f" % np.rad2deg(t), "comps=%d" % len(comps), "median_h=%.0f" % mh,
             "new_line_if_jump>%.0f" % (0.95 * mh), "biggest_jumps(size,from_y,to_y)=", [(round(j[0]), j[1], j[2]) for j in jumps])
    rows, cur = [], [by_y[0]]
    for a, b in zip(by_y, by_y[1:]):
        if b["ry"] - a["ry"] > 0.95 * mh:   # a clear vertical jump = new line
            rows.append(cur)
            cur = []
        cur.append(b)
    rows.append(cur)

    # Tall letters + tight line spacing can leave a gap smaller than 0.95 x height between two lines, so two lines
    # get glued together.  The sheet has a KNOWN number of lines: if we found fewer, cut at the (n-1) biggest gaps -
    # but only when those gaps clearly stand out from the rest (the smallest chosen gap >= 1.8x the next one).
    if expected_lines and len(rows) < expected_lines <= len(by_y):
        gap = lambda i: by_y[i + 1]["ry"] - by_y[i]["ry"]
        order = sorted(range(len(by_y) - 1), key=gap, reverse=True)
        chosen = order[:expected_lines - 1]
        smallest = min(gap(i) for i in chosen)
        nxt = gap(order[expected_lines - 1]) if len(order) >= expected_lines else 0.0
        if smallest >= 0.4 * mh and smallest >= 1.8 * nxt:
            cuts = sorted(chosen)
            _log("forced_lines", expected_lines, "smallest_gap=%.0f" % smallest, "next_gap=%.0f" % nxt)
            rows, start = [], 0
            for i in cuts:
                rows.append(by_y[start:i + 1])
                start = i + 1
            rows.append(by_y[start:])
    return [sorted(r, key=lambda c: c["rx"]) for r in rows]


def _drop_stray_specks(rows, expected):
    """If a few more marks than expected were found (e.g. a full stop written after the last letter),
    remove the smallest specks outside the last line.  The last line holds the real punctuation."""
    n = sum(len(r) for r in rows)
    surplus = n - expected
    if surplus <= 0 or surplus > 6 or len(rows) < 3:
        return rows
    area = lambda c: (c["x1"] - c["x0"] + 1) * (c["y1"] - c["y0"] + 1)
    typical = float(np.median([area(c) for r in rows[:-1] for c in r]))
    cand = sorted([(area(c), id(c)) for r in rows[:-1] for c in r if area(c) < 0.25 * typical])[:surplus]
    drop = {i for _, i in cand}
    return [[c for c in r if id(c) not in drop] for r in rows if any(id(c) not in drop for c in r)]


def segment_blobs(binary, scale, expected=69):
    """
    binary: the binarized sheet from _hw_load_and_binarize (ink = minority colour)
    scale : binary.shape[1] / 1000.0
    returns (blobs, row_sizes) - blobs are in reading order and each has "crop",
    the same kind of image slice the old _hw_detect_blobs_in_row produced (own glyph only).
    """
    b, ink, bg_value = _ink_and_background(binary)
    min_area = max(25, int(12 * scale * scale))
    comps, lab = _stroke_components(ink, scale, min_area)
    if not comps:
        return [], []
    comps = _keep_main_cluster(comps)
    comps = _attach_dots(comps)
    comps = _merge_close_ticks(comps)
    comps = _merge_stacked_parts(comps)
    comps = _merge_fragments(comps)
    rows = _order(comps, expected_lines=EXPECTED_LINES)
    rows = _drop_stray_specks(rows, expected)
    ordered = [c for r in rows for c in r]
    row_sizes = [len(r) for r in rows]

    blobs = []
    for c in ordered:
        y0, y1, x0, x1 = c["y0"], c["y1"] + 1, c["x0"], c["x1"] + 1
        crop = b[y0:y1, x0:x1].copy()
        own = np.isin(lab[y0:y1, x0:x1], list(c["ids"]))
        # keep only this glyph's own pixels (a neighbour's tail must not leak in)
        keep = cv2.dilate(own.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
        crop[~keep] = bg_value
        blobs.append({"crop": crop, "x": c["x0"], "y": c["y0"],
                      "w": c["x1"] - c["x0"] + 1, "h": c["y1"] - c["y0"] + 1})
    return blobs, row_sizes


def orientation_score(blobs, row_sizes, expected=69):
    """Lower = more like a correctly oriented calibration sheet.
    Close to `expected` glyphs, only a handful of lines, and the first line (tall small letters)
    taller than the last line (full stops, commas, hyphen)."""
    if not blobs:
        return 10 ** 6
    score = abs(len(blobs) - expected)
    score += 2 * max(0, len(row_sizes) - 10)
    if len(row_sizes) >= 3:
        first = blobs[:row_sizes[0]]
        last = blobs[-row_sizes[-1]:]
        if float(np.median([g["h"] for g in first])) < float(np.median([g["h"] for g in last])):
            score += 20
    return score