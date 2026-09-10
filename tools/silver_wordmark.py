"""SILVER wordmark — geometric caps drawn from the mark's own vocabulary.

Rules the letterforms obey:
  * monolinear: every stroke is exactly STROKE wide
  * the S is the mark itself — knot plus a stub of its bands
  * every diagonal (V arms, R leg) sits at BASE_ANGLE off vertical
  * flat terminals, mitred joins, no optical corrections beyond overshoot

Cap height is 100 units. Baseline y = 100, cap line y = 0, y grows downward
so the geometry drops straight into SVG without a flip.
"""

import math
import sys

from shapely.affinity import rotate, scale as affine_scale, translate
from shapely.geometry import LineString, Polygon, box
from shapely.ops import unary_union

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from silver_logo import (  # noqa: E402
    BASE_ANGLE,
    knot_geometry,
    mark_geometry,
)

H = 100.0                                   # cap height
STROKE = 16.6                               # = 45/271, the mark's own ratio
HW = STROKE / 2
TAN = math.tan(math.radians(BASE_ANGLE))    # 0.5109 — the brand angle
TRACK = 15.0                                # letter spacing
BUF = dict(cap_style="flat", join_style="mitre", mitre_limit=24)


def _stroke(pts, hw=HW):
    return LineString(pts).buffer(hw, **BUF)


def _rot(p, deg):
    a = math.radians(deg)
    c, s = math.cos(a), math.sin(a)
    return p[0] * c - p[1] * s, p[0] * s + p[1] * c


def _arc(cx, cy, rx, ry, a0, a1, n=96):
    return [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
             cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n)))
            for i in range(n + 1)]


# --- glyphs ------------------------------------------------------------------

STUB = 30.0   # how far the mark's bands survive into the letter


def glyph_S():
    """The logo itself, serving as the letter.

    This is `silver_logo.mark_geometry()` — byte for byte the same shape as
    silver-mark.svg, built from the same config — rotated upright and cropped.
    Rotation is rigid, so the curve is unchanged; the only thing the letter
    does that the mark does not is stop the bands short.

    Rotating by BASE_ANGLE cancels the 27.07 deg lean the bands exit at, which
    stands the knot upright and lays the bands flat. Keeping a short length of
    them gives the S two slab terminals, so the word carries the actual mark
    rather than a letter that resembles it. STUB is the only free parameter —
    run the bands full length and they swamp the word.
    """
    whole = rotate(mark_geometry(clip_tile=False), BASE_ANGLE, origin=(600, 600))
    core = rotate(knot_geometry(), BASE_ANGLE, origin=(600, 600))

    # scale on the knot alone: the bands must not decide the cap height
    cb = core.bounds
    k = H / (cb[3] - cb[1])
    whole = affine_scale(whole, k, k, origin=(0, 0))
    core = affine_scale(core, k, k, origin=(0, 0))

    cb = core.bounds
    whole = translate(whole, -cb[0], -cb[1])
    core = translate(core, -cb[0], -cb[1])

    cb = core.bounds
    whole = whole.intersection(box(cb[0] - STUB, -H, cb[2] + STUB, 2 * H))
    b = whole.bounds
    return translate(whole, -b[0], 0)


def glyph_I():
    return _stroke([(HW, 0), (HW, H)])


def glyph_L(w=78.0):
    return _stroke([(HW, 0), (HW, H - HW), (w, H - HW)])


def glyph_V():
    """Drawn as one outline rather than two buffered strokes: the apex has to
    come to a real point on the baseline, and the caps have to be cut flat on
    the cap line, which stroke buffering cannot give us."""
    th = math.radians(BASE_ANGLE)
    sin_t, cos_t = math.sin(th), math.cos(th)
    ay = H - HW / sin_t                   # apex joint, so the tip lands on H
    dx = TAN * ay
    xl, xr = HW / cos_t, HW / cos_t + 2 * dx
    cx = (xl + xr) / 2
    return Polygon([
        (xl - HW / cos_t, 0), (cx, ay + HW / sin_t), (xr + HW / cos_t, 0),
        (xr - HW / cos_t, 0), (cx, ay - HW / sin_t), (xl + HW / cos_t, 0),
    ])


def glyph_E(w=80.0):
    mid = H / 2
    return unary_union([
        _stroke([(HW, 0), (HW, H)]),
        _stroke([(0, HW), (w, HW)]),
        _stroke([(0, mid), (w * 0.88, mid)]),
        _stroke([(0, H - HW), (w, H - HW)]),
    ])


def glyph_R(w=82.0):
    """Flat-sided bowl on true quarter circles, then a straight leg on the
    brand angle — the only diagonal the letter is allowed."""
    bowl_bottom = 52.0
    r = (bowl_bottom - HW) / 2
    cy = HW + r
    xa = w - HW - r
    bowl = _stroke([(HW, HW), (xa, HW)]
                   + _arc(xa, cy, r, r, -90, 90)
                   + [(xa, bowl_bottom), (HW, bowl_bottom)])
    # the leg runs past the baseline and gets cut there, so its right edge
    # lands exactly on the letter width instead of the cap overshooting it
    end = (w - HW / math.cos(math.radians(BASE_ANGLE)), H)
    start = (end[0] - TAN * (H - bowl_bottom), bowl_bottom)   # inside the bar,
    leg = _stroke([start, (end[0] + TAN * 8, H + 8)])         # so no notch
    return unary_union([_stroke([(HW, 0), (HW, H)]), bowl, leg])


_MAKE = {"S": glyph_S, "I": glyph_I, "L": glyph_L,
         "V": glyph_V, "E": glyph_E, "R": glyph_R}


def glyph(ch):
    """Any terminal that overshoots gets cut flat on the cap line or the
    baseline — the same thing a type designer does to a diagonal."""
    return _MAKE[ch]().intersection(box(-500, 0, 500, H))


GLYPHS = {ch: (lambda c=ch: glyph(c)) for ch in _MAKE}


# Optical sidebearings. A flat edge needs the full gap; a round or diagonal
# edge has to be tucked in or it reads as a hole in the word.
BEARING = {
    "S": (-3, 9), "I": (0, 0), "L": (0, -15),
    "V": (-9, -9), "E": (0, -2), "R": (0, -7),
}


def wordmark(text="SILVER", track=TRACK):
    """Union of the set word, its origin at (0, 0), baseline at y = H."""
    parts, x = [], 0.0
    prev_right = 0.0
    for i, ch in enumerate(text):
        g = glyph(ch)
        gx0, _, gx1, _ = g.bounds
        left, right = BEARING.get(ch, (0, 0))
        if i:
            x += track + prev_right + left
        parts.append(translate(g, xoff=x - gx0))
        x += gx1 - gx0
        prev_right = right
    return unary_union(parts)


# --- svg ---------------------------------------------------------------------

def _ring(coords):
    return "M " + " L ".join(f"{x:.2f} {y:.2f}" for x, y in coords[:-1]) + " Z"


def path_d(geom):
    polys = geom.geoms if hasattr(geom, "geoms") else [geom]
    out = []
    for p in polys:
        if not isinstance(p, Polygon):
            continue
        out.append(_ring(list(p.exterior.coords)))
        out += [_ring(list(r.coords)) for r in p.interiors]
    return " ".join(out)


if __name__ == "__main__":
    w = wordmark()
    print("wordmark bounds", [round(v, 2) for v in w.bounds])
