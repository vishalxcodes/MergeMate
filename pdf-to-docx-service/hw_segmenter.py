"""
hw_segmenter.py  -  glyph segmentation for the handwriting calibration sheet (v3, writing-style independent).

The sheet holds 69 characters in a KNOWN order, but every writer wraps the lines differently, writes at another size,
and photographs the sheet on another background.  So nothing here assumes a line count, a letter size or a clean photo.

  1. find separate pen-stroke components, drop border junk (long thin strips = the paper edge / cloth) and
     anything far away from the writing,
  2. attach dots / side pieces / detached tails to their letter,
  3. group glyphs into lines (_lines): page tilt removed, side-by-side glyphs with overlapping height are one line,
     pieces of one line are joined, tall letters and glyphs written low / high are placed by their left / right
     neighbours,
  4. blobs that reach into the letter band of two different lines are two glued glyphs and are cut apart,
  5. leading junk line, tiny specks and (only a few) surplus marks are dropped,
  6. lines top -> bottom, glyphs left -> right.

orientation_score() tells how plausible a segmentation is for the calibration sheet, so the
caller can try the photo upright / rotated and keep the best one.
"""
import cv2
import numpy as np

EXPECTED_LINES = None
DEBUG_LOG = None
_LAST = {"theta": 0.0}


def _log(*item):
    if DEBUG_LOG is not None:
        DEBUG_LOG.append(item)


def _bbox(c):
    return (c["x0"], c["y0"], c["x1"], c["y1"])


def _ink_and_background(binary):
    b = binary if binary.ndim == 2 else cv2.cvtColor(binary, cv2.COLOR_BGR2GRAY)
    white_ink = float((b > 127).mean()) < 0.5
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
            if bw > 0.15 * W or bh > 0.15 * H or max(bw, bh) > 4 * max(1, min(bw, bh)):
                continue
        comps.append({"x0": x0, "x1": x1, "y0": y0, "y1": y1, "area": int(area), "ids": {i}, "tiny": tiny})
    return comps, lab


def _keep_main_cluster(comps):
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
    _log("clusters", sorted(len(g) for g in groups.values()))
    keep = set(best)
    for g in groups.values():
        if len(g) >= 6:
            keep.update(g)
    return [comps[i] for i in sorted(keep)]


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
    for d in leftover:
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
    if len(comps) < 3:
        return comps
    hs = [c["y1"] - c["y0"] + 1 for c in comps if not c.get("tiny")]
    if not hs:
        return comps
    href = float(np.median(hs))
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
                a, b = comps[i], comps[j]
                if in_last_line(a) or in_last_line(b) or area(b) >= area(a):
                    continue
                joined_h = max(a["y1"], b["y1"]) - min(a["y0"], b["y0"]) + 1
                v_in = (min(a["y1"], b["y1"]) - max(a["y0"], b["y0"]) + 1) / float(h(b))
                hgap = max(0, max(a["x0"], b["x0"]) - min(a["x1"], b["x1"]) - 1)
                side = v_in >= 0.8 and hgap <= side_gap * href and w(b) <= 0.4 * href and area(b) <= 0.2 * area(a)
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


def _paper_mask(ink, scale):
    H, W = ink.shape
    k = max(15, int(30 * scale)) | 1
    dens = cv2.blur((ink > 0).astype(np.float32), (k, k))
    low = (dens < 0.10).astype(np.uint8)
    low = cv2.morphologyEx(low, cv2.MORPH_OPEN, np.ones((k, k), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(low, connectivity=4)
    if n <= 1:
        return None
    big = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    m = (lab == big).astype(np.uint8) * 255
    cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    out = np.zeros_like(m)
    cv2.drawContours(out, cnts, -1, 255, thickness=-1)
    frac = float((out > 0).mean())
    if frac < 0.25 or frac > 0.97:
        return None
    return cv2.erode(out, np.ones((max(3, int(12 * scale)) | 1,) * 2, np.uint8))


def _ink_centroids(comps, lab, ink):
    for c in comps:
        sub = np.isin(lab[c["y0"]:c["y1"] + 1, c["x0"]:c["x1"] + 1], list(c["ids"])) & \
              (ink[c["y0"]:c["y1"] + 1, c["x0"]:c["x1"] + 1] > 0)
        ys, xs = np.where(sub)
        if len(ys):
            c["cy"] = float(ys.mean() + c["y0"]); c["cx"] = float(xs.mean() + c["x0"])
        else:
            c["cy"] = (c["y0"] + c["y1"]) / 2.0; c["cx"] = (c["x0"] + c["x1"]) / 2.0
    for c in comps:
        c["cx_raw"], c["cy_raw"] = c["cx"], c["cy"]


def _split_by_bands(c, lab, ink, bands, mh):
    """Cut a glued blob into one glyph per line it reaches into.  Separate ink pieces go with the line they sit in;
    when the blob is one single piece it is cut at its thinnest place between the two lines."""
    theta = _LAST["theta"]
    y0, y1, x0, x1 = c["y0"], c["y1"], c["x0"], c["x1"]
    h, w = y1 - y0 + 1, x1 - x0 + 1
    if "pix" in c:
        own = np.zeros((h, w), bool)
        py, px, m = c["pix"]
        own[py - y0:py - y0 + m.shape[0], px - x0:px - x0 + m.shape[1]] = m
    else:
        own = np.isin(lab[y0:y1 + 1, x0:x1 + 1], list(c["ids"])) & (ink[y0:y1 + 1, x0:x1 + 1] > 0)
    ys, xs = np.nonzero(own)
    if len(ys) < 30:
        return None
    ry = (ys + y0) * np.cos(theta) - (xs + x0) * np.sin(theta)
    pad = 0.1 * mh
    mass = [int(((ry >= tp - pad) & (ry <= bt + pad)).sum()) for tp, bt in bands]
    rel = [k for k, v in enumerate(mass) if v >= max(15, 0.12 * len(ys))]
    if len(rel) < 2:
        return None
    rel = sorted(rel, key=lambda k: mass[k], reverse=True)[:2]
    rel.sort(key=lambda k: bands[k][0])
    A, B = rel
    n, cl = cv2.connectedComponents(own.astype(np.uint8), connectivity=8)
    label_of_pixel = cl[ys, xs]
    side = np.zeros(len(ys), int)            # 0 -> upper line A, 1 -> lower line B
    for piece in range(1, n):
        sel = label_of_pixel == piece
        r = ry[sel]
        ma = int(((r >= bands[A][0] - pad) & (r <= bands[A][1] + pad)).sum())
        mb = int(((r >= bands[B][0] - pad) & (r <= bands[B][1] + pad)).sum())
        if ma == mb:
            ma, mb = -abs(r.mean() - (bands[A][0] + bands[A][1]) / 2.0), -abs(r.mean() - (bands[B][0] + bands[B][1]) / 2.0)
        side[sel] = 0 if ma > mb else 1
    if side.min() == side.max():             # one single connected piece: cut at the thinnest row between the lines
        lo = min(bands[A][1], bands[B][0]) - 0.25 * mh
        hi = max(bands[A][1], bands[B][0]) + 0.25 * mh
        grid = np.arange(int(lo), int(hi) + 1)
        if len(grid) < 2:
            return None
        proj = np.array([int(((ry >= g) & (ry < g + 1)).sum()) for g in grid])
        cut = grid[int(np.argmin(proj))]
        side = (ry > cut).astype(int)
        if side.min() == side.max():
            return None
    parts = []
    for s in (0, 1):
        m = np.zeros((h, w), bool)
        m[ys[side == s], xs[side == s]] = True
        yy, xx = np.nonzero(m)
        if len(yy) < 8:
            return None
        parts.append({"x0": int(xx.min() + x0), "x1": int(xx.max() + x0), "y0": int(yy.min() + y0), "y1": int(yy.max() + y0),
                      "area": int(m.sum()), "ids": set(c["ids"]), "tiny": False,
                      "pix": (int(yy.min() + y0), int(xx.min() + x0), m[yy.min():yy.max() + 1, xx.min():xx.max() + 1])})
    return parts


def _drop_edge_strips(comps, W):
    """The edge of the sheet / the cloth next to it shows up as LONG THIN strips close to the left or right side of the
    photo.  When such a long strip exists, it marks the paper edge: it is dropped together with every other small
    piece lying outside it.  (A normal letter is never a strip: it is neither that long nor that thin.)"""
    if len(comps) < 8:
        return comps
    href = float(np.median([c["y1"] - c["y0"] + 1 for c in comps]))
    zone = 0.12 * W
    ext = lambda c: max(c["x1"] - c["x0"] + 1, c["y1"] - c["y0"] + 1)
    thin = lambda c: ext(c) >= 5 * max(1, min(c["x1"] - c["x0"] + 1, c["y1"] - c["y0"] + 1))
    in_left = lambda c: c["x1"] < zone
    in_right = lambda c: c["x0"] > W - 1 - zone
    out = list(comps)
    for side, inside in (("left", in_left), ("right", in_right)):
        strips = [c for c in out if inside(c) and thin(c) and ext(c) >= 1.5 * href]
        if not any(ext(c) >= 3 * href for c in strips):
            continue
        if side == "left":
            cut = max(c["x1"] for c in strips) + 0.5 * href
            out = [c for c in out if c["x1"] > cut]
        else:
            cut = min(c["x0"] for c in strips) - 0.5 * href
            out = [c for c in out if c["x0"] < cut]
        _log("edge_strip", side, len(strips), int(cut))
    return out


def _lines(comps, mh, reach=10.0):
    """Group glyphs into text lines WITHOUT knowing how many lines there are or how the writer sloped them.
    1. The page tilt is taken out first (a line that slopes 2 degrees drifts by 50 px over the page).
    2. Two ordinary-sized glyphs are on the same line when they stand side by side (not on top of each other) and
       their vertical extents overlap clearly.  Tall letters (f, g, j, y ...) overlap their neighbours too, so
       neither they nor a slope break a line the way grouping by centre height did.
    3. Pieces of one line that were not linked (a gap, a tall letter in between) are joined when their line bands
       sit at the same height and never put two glyphs on top of each other.
    4. Glyphs much taller than normal (descender AND ascender in one piece, or two glyphs glued) are placed last."""
    n = len(comps)
    if n == 0:
        return [], []
    H = [c["y1"] - c["y0"] + 1 for c in comps]
    Wd = [c["x1"] - c["x0"] + 1 for c in comps]
    normal = [i for i in range(n) if H[i] <= 1.6 * mh]
    ref = [comps[i] for i in normal] if len(normal) >= 12 else comps
    theta = np.deg2rad(_estimate_skew_deg(ref)) if len(ref) >= 12 else 0.0
    _LAST["theta"] = theta
    for i, c in enumerate(comps):
        xc, yc = (c["x0"] + c["x1"]) / 2.0, (c["y0"] + c["y1"]) / 2.0
        c["ry"] = yc * np.cos(theta) - xc * np.sin(theta)
        c["rx"] = xc * np.cos(theta) + yc * np.sin(theta)
        c["ylo"], c["yhi"] = c["ry"] - H[i] / 2.0, c["ry"] + H[i] / 2.0
    par = {i: i for i in normal}

    def find(a):
        while par[a] != a:
            par[a] = par[par[a]]
            a = par[a]
        return a

    for ai, i in enumerate(normal):
        a = comps[i]
        for j in normal[ai + 1:]:
            b = comps[j]
            xgap = max(a["x0"], b["x0"]) - min(a["x1"], b["x1"])
            if xgap < 0 and -xgap > 0.3 * min(Wd[i], Wd[j]):
                continue
            if xgap > reach * mh:
                continue
            yov = min(a["yhi"], b["yhi"]) - max(a["ylo"], b["ylo"])
            if yov >= 0.35 * min(H[i], H[j]):
                par[find(i)] = find(j)
    groups = {}
    for i in normal:
        groups.setdefault(find(i), []).append(i)

    def stacked(g):
        for ai, i in enumerate(g):
            for j in g[ai + 1:]:
                a, b = comps[i], comps[j]
                ov = min(a["x1"], b["x1"]) - max(a["x0"], b["x0"]) + 1
                if ov > 0.3 * min(Wd[i], Wd[j]):
                    return True
        return False

    todo, lines = list(groups.values()), []
    while todo:
        g = todo.pop()
        if len(g) > 1 and stacked(g):
            g = sorted(g, key=lambda i: comps[i]["ry"])
            k = max(range(len(g) - 1), key=lambda t: comps[g[t + 1]]["ry"] - comps[g[t]]["ry"])
            todo += [g[:k + 1], g[k + 1:]]
        else:
            lines.append(g)
    if not lines:
        return [], []

    band = lambda l: (float(np.median([comps[i]["ylo"] for i in l])), float(np.median([comps[i]["yhi"] for i in l])))
    merged = True
    while merged:
        merged = False
        for p in range(len(lines)):
            for q in range(p + 1, len(lines)):
                (a0, a1), (b0, b1) = band(lines[p]), band(lines[q])
                ov = min(a1, b1) - max(a0, b0)
                close = abs((a0 + a1) / 2.0 - (b0 + b1) / 2.0) < 0.6 * mh     # tall + low marks of one line (' " . ,)
                if (ov >= 0.6 * min(a1 - a0, b1 - b0) or close) and not stacked(lines[p] + lines[q]):
                    lines[p] = lines[p] + lines[q]
                    del lines[q]
                    merged = True
                    break
            if merged:
                break
    bands = [band(l) for l in lines]
    for i in range(n):
        if i in par:
            continue
        c = comps[i]
        scores = [max(0.0, min(c["yhi"], bt) - max(c["ylo"], tp)) / max(1.0, bt - tp) for tp, bt in bands]
        k = int(np.argmax(scores))
        if scores[k] <= 0:
            k = int(np.argmin([abs(c["ry"] - (tp + bt) / 2.0) for tp, bt in bands]))
        lines[k].append(i)
    # refinement: a glyph that bridged two lines (written lower / higher than its neighbours) sits where its
    # LEFT and RIGHT neighbours are.  Score every line by how well the glyph fits against its nearest neighbour on
    # each side; a line that already has a glyph standing on top of it can never take it.
    def fit(g, members):
        a = comps[g]
        left = right = None
        for m in members:
            if m == g:
                continue
            b = comps[m]
            ov = min(a["x1"], b["x1"]) - max(a["x0"], b["x0"]) + 1
            if ov > 0.3 * min(Wd[g], Wd[m]):
                return -1.0
            xgap = max(a["x0"], b["x0"]) - min(a["x1"], b["x1"])
            if xgap > 6 * mh:
                continue
            if b["rx"] < a["rx"]:
                if left is None or xgap < left[0]:
                    left = (xgap, m)
            elif right is None or xgap < right[0]:
                right = (xgap, m)
        covs = []
        for nb in (left, right):
            if nb is not None:
                b = comps[nb[1]]
                yov = min(a["yhi"], b["yhi"]) - max(a["ylo"], b["ylo"])
                covs.append(max(0.0, yov) / max(1.0, min(H[g], H[nb[1]])))
        if not covs:
            return 0.0
        return float(np.mean(covs)) * (1.0 if len(covs) == 2 else 0.8)

    def align(g, members):
        """Fallback for a glyph with no useful neighbour overlap (a small 'a' that sits low next to a tall 'b'):
        how close are its top / centre / bottom to the line's x-height top / centre / baseline?"""
        others = [m for m in members if m != g]
        if not others:
            return 0.0
        a = comps[g]
        for m in others:
            b = comps[m]
            ov = min(a["x1"], b["x1"]) - max(a["x0"], b["x0"]) + 1
            if ov > 0.3 * min(Wd[g], Wd[m]):
                return -1.0
        T = float(np.median([comps[m]["ylo"] for m in others]))
        B = float(np.median([comps[m]["yhi"] for m in others]))
        C = float(np.median([comps[m]["ry"] for m in others]))
        d = min(abs(a["ylo"] - T), abs(a["yhi"] - B), abs(a["ry"] - C)) / mh
        return max(0.0, 1.0 - d / 0.8) * 0.5

    for _ in range(3):
        moved = False
        for g in range(n):
            cur = next(k for k, l in enumerate(lines) if g in l)
            sc = [fit(g, l) for l in lines]
            if max(sc) < 0.3:
                sc = [align(g, l) for l in lines]
            best = int(np.argmax(sc))
            if best != cur and sc[best] > sc[cur] + 0.15:
                lines[cur].remove(g)
                lines[best].append(g)
                moved = True
        lines = [l for l in lines if l]
        if not moved:
            break
    # a glyph that is alone on its "line" (a small 'a' written lower than its tall neighbour) joins the nearest
    # line it is not standing on top of, if it is reasonably close to that line's letter band
    for g in [l[0] for l in lines if len(l) == 1]:
        cur = next((k for k, l in enumerate(lines) if l == [g]), None)
        if cur is None or len(lines) < 2:
            continue
        best, best_d = None, 0.9
        for k, l in enumerate(lines):
            if k == cur or stacked(l + [g]):
                continue
            T, B = band(l)
            C = (T + B) / 2.0
            d = min(abs(comps[g]["ylo"] - T), abs(comps[g]["yhi"] - B), abs(comps[g]["ry"] - C)) / mh
            if d < best_d:
                best, best_d = k, d
        if best is not None:
            lines[best].append(g)
            del lines[cur]
    bands = [band(l) for l in lines]
    order = sorted(range(len(lines)), key=lambda k: (bands[k][0] + bands[k][1]) / 2.0)
    lines = [lines[k] for k in order]
    bands = [bands[k] for k in order]
    return [sorted(l, key=lambda i: comps[i]["rx"]) for l in lines], bands


def _glued_candidates(comps, bands, mh):
    """A blob that is tall AND covers the ordinary letter band of two different lines is two letters of neighbouring
    lines that were joined (by the stroke-closing, or by a wrong merge).  A real f / g / j / y only reaches
    into the gap between its own line and the next one, never into the next line's letter band."""
    out = []
    for i, c in enumerate(comps):
        if c["y1"] - c["y0"] + 1 <= 1.5 * mh:
            continue
        cover = [max(0.0, min(c["yhi"], bt) - max(c["ylo"], tp)) / max(1.0, bt - tp) for tp, bt in bands]
        if sum(1 for v in cover if v >= 0.4) >= 2:
            out.append(i)
    return out


def segment_blobs(binary, scale, expected=69):
    """
    binary: the binarized sheet from _hw_load_and_binarize (ink = minority colour)
    scale : binary.shape[1] / 1000.0
    returns (blobs, row_sizes) - blobs in reading order, each with "crop" (own glyph only); row_sizes = glyphs per
    line (the number of lines depends on how the writer wrapped them).
    """
    b, ink, bg_value = _ink_and_background(binary)
    H, W = ink.shape
    pm = _paper_mask(ink, scale)
    if pm is not None:
        ink = cv2.bitwise_and(ink, pm)
    min_area = max(25, int(12 * scale * scale))
    comps, lab = _stroke_components(ink, scale, min_area)
    if not comps:
        return [], []
    comps = _drop_edge_strips(comps, W)
    comps = _keep_main_cluster(comps)
    comps = _attach_dots(comps)
    comps = _merge_close_ticks(comps)
    comps = _merge_stacked_parts(comps)
    comps = _merge_fragments(comps)
    _ink_centroids(comps, lab, ink)

    def typical_height(cs):
        hs = [c["y1"] - c["y0"] + 1 for c in cs]
        m0 = float(np.median(hs))
        return float(np.median([h for h in hs if h <= 1.6 * m0] or hs))

    mh = typical_height(comps)
    lines, bands = _lines(comps, mh)

    # glued letters of neighbouring lines (also wrong merges): split them whatever the glyph count is
    for _ in range(4):
        gl = _glued_candidates(comps, bands, mh)
        did = False
        for i in gl:
            parts = _split_by_bands(comps[i], lab, ink, bands, mh)
            if parts and len(parts) >= 2:
                _log("split", _bbox(comps[i]), len(parts))
                comps = comps[:i] + parts + comps[i + 1:]
                did = True
                break
        if not did:
            break
        _ink_centroids(comps, lab, ink)
        lines, bands = _lines(comps, mh)

    # junk: a mark above the first line (paper crease) - a real first line holds many letters
    while len(lines) >= 3 and len(lines[0]) <= 2 and len(lines[1]) >= 5:
        _log("junk_first_line", [_bbox(comps[i]) for i in lines[0]])
        drop = set(lines[0])
        comps = [c for i, c in enumerate(comps) if i not in drop]
        lines, bands = _lines(comps, mh)

    # thin little specks away from the last line (a dot after a letter, a mark on the paper)
    if lines:
        last_y = max(c["cy"] for c in comps) - 2.5 * mh
        isspeck = lambda c: (max(c["x1"] - c["x0"] + 1, c["y1"] - c["y0"] + 1) <= 0.25 * mh and c["cy"] < last_y)
        sp = [c for c in comps if isspeck(c)]
        if sp:
            _log("specks", [_bbox(c) for c in sp])
            comps = [c for c in comps if not isspeck(c)]
            lines, bands = _lines(comps, mh)

    # a few too many glyphs: the smallest pieces outside the last line are marks, not letters
    surplus = len(comps) - expected
    if 0 < surplus <= 6 and len(lines) >= 3:
        bottom = max(c["ry"] for c in comps) - 3.5 * mh
        cand = sorted([i for i in range(len(comps)) if comps[i]["ry"] < bottom], key=lambda i: comps[i]["area"])[:surplus]
        _log("surplus_dropped", [_bbox(comps[i]) for i in cand])
        drop = set(cand)
        comps = [c for i, c in enumerate(comps) if i not in drop]
        lines, bands = _lines(comps, mh)

    rows = [[comps[i] for i in l] for l in lines]
    ordered = [c for r in rows for c in r]
    row_sizes = [len(r) for r in rows]

    blobs = []
    for c in ordered:
        y0, y1, x0, x1 = c["y0"], c["y1"] + 1, c["x0"], c["x1"] + 1
        crop = b[y0:y1, x0:x1].copy()
        if "pix" in c:
            own = c["pix"][2]
            if own.shape != crop.shape:
                own = np.zeros(crop.shape, bool)
        else:
            own = np.isin(lab[y0:y1, x0:x1], list(c["ids"]))
        keep = cv2.dilate(own.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
        crop[~keep] = bg_value
        blobs.append({"crop": crop, "x": c["x0"], "y": c["y0"],
                      "w": c["x1"] - c["x0"] + 1, "h": c["y1"] - c["y0"] + 1})
    return blobs, row_sizes


def orientation_score(blobs, row_sizes, expected=69):
    """Lower = more like a correctly oriented calibration sheet."""
    if not blobs:
        return 10 ** 6
    score = abs(len(blobs) - expected)
    score += 2 * max(0, len(row_sizes) - 16)
    # the sheet is four blocks (a-z = 26, A-Z = 52, digits = 62, punctuation = 69) and every block starts on a new
    # line, so in the right orientation the running glyph count passes 26, 52 and 62 exactly at line ends
    run, ends = 0, []
    for n in row_sizes:
        run += n
        ends.append(run)
    hits = sum(1 for t in (26, 52, 62) if any(abs(e - t) <= 1 for e in ends))
    score += 8 * (3 - hits)
    if len(row_sizes) >= 3:
        first = blobs[:row_sizes[0]]
        last = blobs[-row_sizes[-1]:]
        if float(np.median([g["h"] for g in first])) < float(np.median([g["h"] for g in last])):
            score += 20
    return score