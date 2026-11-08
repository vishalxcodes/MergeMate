"""
hw_settings.py - the few look-settings a user may change after seeing the generated page.

Only the keys listed in LIMITS are accepted, every value is forced into its allowed range, anything else is ignored.
A key the user did NOT send is simply absent from the result, so the renderer keeps its own default for it
(= nothing changes for a user who never touches a slider).
"""
import math

# key: (min, max).   These map straight onto hw_renderer's cfg (see settings_to_cfg).
LIMITS = {
    "slant_deg":  (0.0, 15.0),   # lean of every letter to the right
    "pen_boost":  (0.8, 2.0),    # pen thickness (hw_renderer still caps it with pen_max_mm)
    "letter_gap": (0.0, 0.4),    # space between letters, fraction of x_height
    "word_gap":   (0.8, 2.0),    # space between words, fraction of x_height
    "size":       (0.85, 1.15),  # 1.0 = default letter size
}
MAX_SEED = 9999


def _number(v):
    """float(v) for numbers and numeric strings; None for everything else (bool, None, nan, inf, text)."""
    if isinstance(v, bool) or v is None:
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    return f if math.isfinite(f) else None


def clean_settings(raw, legacy=None):
    """raw: the "settings" object from the request (anything may come).  legacy: older top-level fields
    (pen_boost, slant_deg) - used only when "settings" does not carry that key.
    Returns {key: float} with only valid keys, each clamped to LIMITS."""
    out = {}
    for src in (legacy if isinstance(legacy, dict) else {}, raw if isinstance(raw, dict) else {}):
        for key, (lo, hi) in LIMITS.items():
            if key in src:
                f = _number(src[key])
                if f is not None:
                    out[key] = min(hi, max(lo, f))
    return out


def clean_seed(v, default=1):
    f = _number(v)
    if f is None:
        return default
    return int(min(MAX_SEED, max(0, f)))


def settings_to_cfg(settings, default_x_height):
    """Cleaned settings -> the cfg keys of hw_renderer.render_pages."""
    cfg = {}
    for key in ("slant_deg", "pen_boost", "letter_gap", "word_gap"):
        if key in settings:
            cfg[key] = settings[key]
    if "size" in settings:
        cfg["x_height"] = default_x_height * settings["size"]
    return cfg