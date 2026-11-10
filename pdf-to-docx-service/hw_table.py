"""
hw_table.py - draws a table on the handwriting page: cell text in the user's handwriting + hand-drawn grid lines.

draw_table(tbl, base, env) -> next text baseline (the caller continues writing from there).

tbl = {"header": [cell, ...] or None, "rows": [[cell, ...], ...]}      cell = list of [text, colour] spans
env = object with these attributes (hw_renderer fills them in from its own closures):
    left, right_lim            x range the table may use (right_lim already includes the right safety gap)
    xh, cap_h, line_height     font metrics in px
    stroke_w, black            pen thickness and ink colour for the grid
    borders (optional)         True (default) = hand-drawn grid, False = only spacing between columns
    bottom_limit, top_base     page geometry (px)
    rnd                        random.Random
    to_words(spans)            -> words (as used by hw_renderer)
    plan_line(words)           -> planned words  ({"adv", "w", "space", ...})
    draw_line(planned, x, baseline)   writes one line of planned words
    get_page()                 -> current PIL page
    next_page()                -> finishes the current page, returns the new one
    connector(page, p0, p1, width, color, rnd, sag=None)   pen stroke (hw_renderer._draw_connector)
"""


def _wrap(planned, wmax):
    lines, cur, x = [], [], 0.0
    for pw in planned:
        if cur and x + pw["w"] > wmax + 0.5:
            lines.append(cur)
            cur, x = [], 0.0
        cur.append(pw)
        x += pw["adv"] + pw["space"]
    if cur:
        lines.append(cur)
    return lines


def _col_widths(grid, ncol, avail):
    nat, mn = [1.0] * ncol, [1.0] * ncol          # natural one-line width / longest single word per column
    for prow in grid:
        for ci, pl in enumerate(prow):
            if pl:
                nat[ci] = max(nat[ci], sum(p["adv"] + p["space"] for p in pl) - pl[-1]["space"])
                mn[ci] = max(mn[ci], max(p["w"] for p in pl))
    if sum(nat) <= avail:                          # everything fits on one line: fill the page width
        extra = avail - sum(nat)
        return [n + extra * n / sum(nat) for n in nat]
    if sum(mn) >= avail:                           # very narrow: squeeze (a very long word may touch the border)
        return [m * avail / sum(mn) for m in mn]
    spare = avail - sum(mn)                        # long cells wrap; share the spare width by how much each wants
    want = [n - m for n, m in zip(nat, mn)]
    tot = sum(want) or 1.0
    return [m + spare * w / tot for m, w in zip(mn, want)]


def draw_table(tbl, base_in, env):
    e = env
    rnd, xh = e.rnd, e.xh
    head = tbl.get("header")
    rows = ([head] if head else []) + list(tbl.get("rows") or [])
    if not rows:
        return base_in
    ncol = max(len(r) for r in rows)
    pad = 0.8 * xh

    grid = []                                      # plan every cell once: widths used for layout == widths drawn
    for row in rows:
        prow = []
        for ci in range(ncol):
            words = e.to_words(row[ci]) if ci < len(row) else []
            prow.append(e.plan_line(words) if words else [])
        grid.append(prow)

    usable = e.right_lim - e.left
    avail = max(ncol * 2.0 * xh, usable - 2 * pad * ncol)
    tw = _col_widths(grid, ncol, avail)
    x_edges = [float(e.left)]
    for t in tw:
        x_edges.append(x_edges[-1] + t + 2 * pad)

    pitch = 0.85 * e.line_height                   # distance between wrapped lines inside a cell
    top_off = e.cap_h + 0.45 * xh                  # row top -> first baseline
    bot_pad = 0.9 * xh                             # last baseline -> row bottom (room for descenders)
    pen = max(1.0, e.stroke_w * 0.9)

    row_top = base_in - top_off
    seg = {"bounds": [row_top], "first": True}

    borders = getattr(e, "borders", True)         # False = plain aligned columns, no grid lines

    def finish_segment():
        ys = seg["bounds"]
        if len(ys) < 2 or not borders:
            return
        pg = e.get_page()
        xl, xr = x_edges[0], x_edges[-1]
        for k, yy in enumerate(ys):
            w_ = pen * (1.5 if (head and seg["first"] and k == 1) else 1.0)      # heavier line under the header
            e.connector(pg, (xl + rnd.uniform(-0.3, 0.3) * xh, yy + rnd.uniform(-0.1, 0.1) * xh),
                        (xr + rnd.uniform(-0.3, 0.3) * xh, yy + rnd.uniform(-0.08, 0.08) * xh),
                        w_, e.black, rnd, sag=rnd.uniform(-0.004, 0.004) * (xr - xl))
        for xx in x_edges:
            e.connector(pg, (xx + rnd.uniform(-0.15, 0.15) * xh, ys[0] + rnd.uniform(-0.2, 0.2) * xh),
                        (xx + rnd.uniform(-0.15, 0.15) * xh, ys[-1] + rnd.uniform(-0.2, 0.2) * xh),
                        pen, e.black, rnd, sag=rnd.uniform(-0.004, 0.004) * (ys[-1] - ys[0]))

    for prow in grid:
        cells = [_wrap(pl, tw[ci]) if pl else [] for ci, pl in enumerate(prow)]
        n = max(1, max(len(cl) for cl in cells))
        row_h = (n - 1) * pitch + top_off + bot_pad
        at_top = row_top <= e.top_base - top_off + 1
        if row_top + row_h > e.bottom_limit and not at_top:     # row does not fit: grid for this page, continue on the next
            finish_segment()
            e.next_page()
            row_top = e.top_base - top_off
            seg["bounds"] = [row_top]
            seg["first"] = False
        for ci, cl in enumerate(cells):
            for li, wl in enumerate(cl):
                e.draw_line(wl, x_edges[ci] + pad, row_top + top_off + li * pitch)
        row_top += row_h
        seg["bounds"].append(row_top)
    finish_segment()
    return row_top + e.cap_h + 1.2 * xh