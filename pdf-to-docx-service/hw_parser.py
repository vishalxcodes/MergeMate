import re

BLACK, BLUE = "black", "blue"
SUPPORTED = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,?!'\"-:\u2022 ")
REPLACEMENTS = {"\u2018": "'", "\u2019": "'", "\u201c": '"', "\u201d": '"', "\u2013": "-", "\u2014": "-", "\u2212": "-", "\u2026": "...", "\u00a0": " ", "\t": "  "}

def _normalize(text):
    for old, new in REPLACEMENTS.items():
        text = text.replace(old, new)
    return text.replace("\r\n", "\n").replace("\r", "\n")

def _clean_inline(s):
    s = re.sub(r"!\[([^\]]*)\]\([^)]*\)", r"\1", s)
    s = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", s)
    s = re.sub(r"`([^`]*)`", r"\1", s)
    s = re.sub(r"(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)", r"\1", s)
    return s

def _spans(s, base_color):
    """Split a line into [text, colour] spans.  **bold** -> black.  <u>..</u> / <uu>..</uu> -> underlined
    (single / double); the underline level is stored in the colour string, e.g. "blue:u2"."""
    spans = []
    for piece in re.split(r"(<uu>.*?</uu>|<u>.*?</u>|<o>.*?</o>)", s):
        if not piece:
            continue
        ul = ""
        m = re.fullmatch(r"<(uu|u|o)>(.*?)</\1>", piece)
        if m:
            ul = {"uu": ":u2", "u": ":u1", "o": ":o"}[m.group(1)]
            piece = m.group(2)
        for part in re.split(r"(\*\*.+?\*\*|__.+?__)", piece):
            if not part:
                continue
            if len(part) > 4 and part[:2] in ("**", "__") and part[-2:] == part[:2]:
                spans.append([part[2:-2], BLACK + ul])
            else:
                spans.append([part, base_color + ul])
    return spans


def parse(text):
    lines = []
    gap_pending = False
    for raw in _normalize(text).split("\n"):
        line = raw.rstrip()
        if not line.strip():
            gap_pending = True
            continue
        if re.fullmatch(r"\s*([-*_])\1{2,}\s*", line):
            gap_pending = True
            continue
        line = re.sub(r"^\s*>\s?", "", line)
        tight = bool(re.match(r"^\s*\[t\]", line))        # "[t] ..." = this line sits closer to the previous one
        line = re.sub(r"^\s*\[t\]\s*", "", line)
        color, indent = BLUE, 0
        m = re.match(r"^\s{0,3}#{1,6}\s+(.*)$", line)
        if m:
            body, color = m.group(1), BLACK
        else:
            m = re.match(r"^(\s*)[-*+\u2022]\s+(.*)$", line)
            if m:
                indent = min(2, len(m.group(1)) // 2)
                body = "\u2022 " + m.group(2)
            else:
                m = re.match(r"^(\s*)(\d+)[.)]\s+(.*)$", line)
                if m:
                    indent = min(2, len(m.group(1)) // 2)
                    body = f"{m.group(2)}. {m.group(3)}"
                else:
                    body = line.strip()
        parts = re.split(r"\s\|\|\s", body, maxsplit=1)
        left_txt, right_txt = parts[0], (parts[1] if len(parts) > 1 else "")
        spans = _spans(_clean_inline(left_txt), color)
        if not spans:
            continue
        item = {"spans": spans, "indent": indent, "gap_before": gap_pending and len(lines) > 0, "tight": tight}
        if right_txt.strip():
            item["right"] = _spans(_clean_inline(right_txt), color)
        lines.append(item)
        gap_pending = False
    used = {ch for ln in lines for txt, _ in (ln["spans"] + ln.get("right", [])) for ch in txt}
    unsupported = sorted(ch for ch in used if ch not in SUPPORTED)
    return {"lines": lines, "unsupported": unsupported}