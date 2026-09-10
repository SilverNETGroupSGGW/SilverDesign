"""Silver mark geometry — Python port of the configurator's build() function.

Produces the three filled paths (top band, bottom band, S ribbon) on a
1200x1200 canvas. Same maths as logo-configurator.html so exported assets
match the live preview exactly.
"""

import math

BASE_ANGLE = 27.07
CX = CY = 600
A = (612.0, 356.0)
M = (600.0, 600.0)
NST, N, N2 = 30, 200, 400

# The user-approved mark.
SILVER = {
    "scale": 0.63, "neck": 0, "entryH": 110, "waistTilt": 28, "waistH": 101,
    "lineWidth": 45, "bandWidth": 180, "slopeLen": 217, "slopeStart": 84,
    "slopeCurve": 0,
    "lean": 0, "brightness": 0.88, "bg": "#15171b", "ink": "#9d9d9f",
}


def _rad(d):
    return d * math.pi / 180


def _rotvis(x, y, deg):
    c, s = math.cos(_rad(deg)), math.sin(_rad(deg))
    return x * c + y * s, -x * s + y * c


def _rot180(p):
    return 1200 - p[0], 1200 - p[1]


def _sclp(p, k):
    return 600 + k * (p[0] - 600), 600 + k * (p[1] - 600)


def _rotpt(p, deg):
    rx, ry = _rotvis(p[0] - CX, p[1] - CY, deg)
    return CX + rx, CY + ry


def _cubic(p0, p1, p2, p3, t):
    u = 1 - t
    a, b, c, d = u ** 3, 3 * u * u * t, 3 * u * t * t, t ** 3
    return (a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
            a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1])


def _sstep(t):
    return t * t * t * (t * (t * 6 - 15) + 10)


def _taper(t, c):
    """Band finish profile. c = 0 is the plain smootherstep ramp; raising it
    blends toward a concave quarter arc, so the taper edge bows inward — the
    curve is cut out of the band, not bulged into the negative space. Both
    limits still run 0 -> 1, so the ends stay flush."""
    s = _sstep(t)
    if not c:
        return s
    k = min(max(c / 100.0, 0.0), 1.0)
    inward = 1 - math.sqrt(max(0.0, 1 - t * t))
    return s + (inward - s) * k


def spine(P):
    """Return just the S centreline, without the ribbon width."""
    u0 = (-math.cos(_rad(BASE_ANGLE)), math.sin(_rad(BASE_ANGLE)))
    u2 = _rotvis(u0[0], u0[1], P["lean"])
    a2b = _rotpt(_sclp(A, P["scale"]), P["lean"])
    A2 = (a2b[0] + u2[0] * P["slopeStart"], a2b[1] + u2[1] * P["slopeStart"])
    wv0 = _rotvis(0.928, 0.371, P["lean"] + P["waistTilt"])
    wl = math.hypot(*wv0)
    wv = (wv0[0] / wl, wv0[1] / wl)

    st = [(A2[0] + u2[0] * P["neck"] * i / NST, A2[1] + u2[1] * P["neck"] * i / NST)
          for i in range(NST)]
    P0 = st[-1]
    P1 = (P0[0] + u2[0] * P["entryH"], P0[1] + u2[1] * P["entryH"])
    P2 = (M[0] - wv[0] * P["waistH"], M[1] - wv[1] * P["waistH"])
    arc = [_cubic(P0, P1, P2, M, i / N) for i in range(N + 1)]
    P0b, P1b, P2b = _rot180(P0), _rot180(P1), _rot180(P2)
    arc2 = [_cubic(M, P2b, P1b, P0b, i / N) for i in range(1, N + 1)]
    st2 = [_rot180(p) for p in reversed(st)]
    return st + arc + arc2 + st2


def build(P):
    """Return {'sPath': pts, 'bandTop': pts, 'bandBot': pts} as point lists."""
    u0 = (-math.cos(_rad(BASE_ANGLE)), math.sin(_rad(BASE_ANGLE)))
    u2 = _rotvis(u0[0], u0[1], P["lean"])
    uo2 = (-u2[0], -u2[1])
    n2 = (-u2[1], u2[0])
    inn2 = (-n2[0], -n2[1])
    HW = P["lineWidth"] / 2

    a2b = _rotpt(_sclp(A, P["scale"]), P["lean"])
    A2 = (a2b[0] + u2[0] * P["slopeStart"], a2b[1] + u2[1] * P["slopeStart"])
    wv0 = _rotvis(0.928, 0.371, P["lean"] + P["waistTilt"])
    wl = math.hypot(*wv0)
    wv = (wv0[0] / wl, wv0[1] / wl)

    st = [(A2[0] + u2[0] * P["neck"] * i / NST, A2[1] + u2[1] * P["neck"] * i / NST)
          for i in range(NST)]
    P0 = st[-1]
    P1 = (P0[0] + u2[0] * P["entryH"], P0[1] + u2[1] * P["entryH"])
    P2 = (M[0] - wv[0] * P["waistH"], M[1] - wv[1] * P["waistH"])
    arc = [_cubic(P0, P1, P2, M, i / N) for i in range(N)]
    P0b, P1b, P2b = _rot180(P0), _rot180(P1), _rot180(P2)
    arc2 = [_cubic(M, P2b, P1b, P0b, i / N) for i in range(N)]
    st2 = [_rot180(p) for p in reversed(st)]
    spine = st + arc + arc2 + st2

    L, R = [], []
    for i, s in enumerate(spine):
        a = spine[max(0, i - 1)]
        b = spine[min(len(spine) - 1, i + 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        ln = math.hypot(dx, dy) or 1
        nx, ny = -dy / ln, dx / ln
        L.append((s[0] + nx * HW, s[1] + ny * HW))
        R.append((s[0] - nx * HW, s[1] - ny * HW))
    s_path = L + R[::-1]

    outer_pt = (A2[0] + n2[0] * HW, A2[1] + n2[1] * HW)
    outer, inner = [], []
    for i in range(N2 + 1):
        s = i / N2 * 900
        e = (outer_pt[0] + uo2[0] * s, outer_pt[1] + uo2[1] * s)
        outer.append(e)
        t = max(0.0, min(s / P["slopeLen"], 1.0))
        w = 2 * HW + (P["bandWidth"] - 2 * HW) * _taper(t, P.get("slopeCurve", 0))
        inner.append((e[0] + inn2[0] * w, e[1] + inn2[1] * w))
    band_top = outer[::-1] + inner
    band_bot = [_rot180(p) for p in band_top]

    return {"sPath": s_path, "bandTop": band_top, "bandBot": band_bot}


def mark_geometry(P=None, clip_tile=True):
    """The mark as one shapely geometry — the single source every S comes from.

    The logo, the icon crop, the lockup tile and the S in the wordmark are all
    this shape. They differ only in how they are oriented and cropped, never in
    how they are built: two code paths producing "the same" S drifted once
    already (a stray scale of 0.50 against the config's 0.63) and nothing
    caught it.
    """
    from shapely.geometry import Polygon, box
    from shapely.ops import unary_union

    g = build(P or SILVER)
    u = unary_union([Polygon(g[k]).buffer(0)
                     for k in ("bandTop", "bandBot", "sPath")])
    return u.intersection(box(0, 0, 1200, 1200)) if clip_tile else u


def knot_geometry(P=None):
    """Just the S, without the bands — for measuring the knot's own extent."""
    from shapely.geometry import Polygon
    return Polygon(build(P or SILVER)["sPath"]).buffer(0)


def path_d(pts):
    return "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in pts) + " Z"


def bbox(P=SILVER):
    g = build(P)
    xs = [p[0] for k in g for p in g[k]]
    ys = [p[1] for k in g for p in g[k]]
    return min(xs), min(ys), max(xs), max(ys)


if __name__ == "__main__":
    print(bbox())
