"""Generate every logo file in logo/ from the geometry, not by hand.

Run: python3 tools/build_logo.py
"""

import json
import math
import os
import re
import sys

from shapely.affinity import scale as sscale, translate
from shapely.geometry import Polygon, box
from shapely.ops import unary_union

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

from foil import RAMP, BASE_ANGLE                      # noqa: E402
from silver_logo import mark_geometry                  # noqa: E402
from silver_wordmark import H as CAP, path_d  # noqa: E402
from wordmark_font import wordmark_svg  # noqa: E402

OUT = os.path.join(ROOT, "logo")
TILE = 1200          # the mark's own canvas
CLEAR = 0.14         # clearspace as a fraction of the tile


# --- svg plumbing ------------------------------------------------------------

def foil_def(vb, ident="foil", ramp=RAMP, angle=BASE_ANGLE):
    """A linear gradient along the brand angle, bright end upper right.

    Projecting the viewBox corners onto the angle keeps the ramp's stops in
    the same place whatever the aspect ratio, so a poster and a favicon show
    the same slice of metal.
    """
    x0, y0, w, h = vb
    th = math.radians(angle)
    ux, uy = math.cos(th), -math.sin(th)
    pts = [(x0, y0), (x0 + w, y0), (x0, y0 + h), (x0 + w, y0 + h)]
    proj = [p[0] * ux + p[1] * uy for p in pts]
    lo, hi = min(proj), max(proj)
    cx, cy = x0 + w / 2, y0 + h / 2
    c = cx * ux + cy * uy
    p1 = (cx + ux * (lo - c), cy + uy * (lo - c))
    p2 = (cx + ux * (hi - c), cy + uy * (hi - c))
    stops = "".join(
        f'\n      <stop offset="{p:.3f}" stop-color="{c}"/>' for p, c in ramp)
    return (f'    <linearGradient id="{ident}" gradientUnits="userSpaceOnUse"'
            f' x1="{p1[0]:.2f}" y1="{p1[1]:.2f}"'
            f' x2="{p2[0]:.2f}" y2="{p2[1]:.2f}">{stops}\n    </linearGradient>')


def svg(vb, body, defs="", bg=None, title=""):
    x0, y0, w, h = vb
    rect = f'\n  <rect x="{x0}" y="{y0}" width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    d = f"\n  <defs>\n{defs}\n  </defs>" if defs else ""
    t = f"\n  <title>{title}</title>" if title else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0} {y0} {w} {h}"'
            f' width="{w}" height="{h}">{t}{d}{rect}\n{body}\n</svg>\n')


def write(name, text):
    path = os.path.join(OUT, name)
    with open(path, "w") as f:
        f.write(text)
    print("  ", os.path.relpath(path, ROOT))


# --- geometry ----------------------------------------------------------------

def mark_geom():
    """The mark clipped to its tile — the one shape everything derives from.

    The three parts are unioned rather than stacked: drawn as separate paths
    they leave a hairline of background showing along every seam once a
    renderer antialiases them.
    """
    return mark_geometry(clip_tile=True)


def mark_paths():
    return [path_d(mark_geom())]


def wordmark_at(cap):
    """The wordmark at a given cap height as (svg path d, width), origin (0, 0).

    Returns path data rather than a shapely geometry: ILVER is set in Figtree
    and its outlines are real curves. Flattening them to polygons to compose
    the word is lossy — it notched the straight-sided letters and holed the R —
    so the letters stay as native path data all the way to the SVG.
    """
    return wordmark_svg(cap=cap)


# --- files -------------------------------------------------------------------

def build_mark():
    vb = (0, 0, TILE, TILE)
    paths = mark_paths()
    clip = ('    <clipPath id="tile">'
            f'<rect width="{TILE}" height="{TILE}"/></clipPath>')
    body = ('  <g clip-path="url(#tile)" fill="{fill}">\n'
            + "\n".join(f'    <path d="{d}"/>' for d in paths)
            + "\n  </g>")

    write("silver-mark.svg",
          svg(vb, body.format(fill="url(#foil)"),
              defs=foil_def(vb) + "\n" + clip, bg="#15171B", title="Silver mark"))
    write("silver-mark-transparent.svg",
          svg(vb, body.format(fill="url(#foil)"),
              defs=foil_def(vb) + "\n" + clip, title="Silver mark, transparent"))
    write("silver-mark-mono-white.svg",
          svg(vb, body.format(fill="#FFFFFF"), defs=clip, title="Silver mark, mono"))
    write("silver-mark-mono-black.svg",
          svg(vb, body.format(fill="#000000"), defs=clip, title="Silver mark, mono"))


def build_wordmark():
    cap = 200.0
    d, width = wordmark_at(cap)
    pad = cap * 0.18
    from svgpathtools import parse_path
    d = parse_path(d).translated(complex(pad, pad)).d()
    vb = (0, 0, round(width + 2 * pad), round(cap + 2 * pad))
    write("silver-wordmark.svg",
          svg(vb, f'  <path d="{d}" fill="url(#foil)"/>',
              defs=foil_def(vb), title="SILVER wordmark"))
    write("silver-wordmark-mono-white.svg",
          svg(vb, f'  <path d="{d}" fill="#FFFFFF"/>', title="SILVER wordmark"))
    write("silver-wordmark-mono-black.svg",
          svg(vb, f'  <path d="{d}" fill="#000000"/>', title="SILVER wordmark"))


TILE_RADIUS = 0.22   # of the tile edge; tracks --radius-lg in the token scale
TILE_CROP = 1.9      # >1 zooms in on the knot so the S reads at small sizes


def _lockup(stacked):
    """Mark tile plus wordmark. Cap height is 0.30 of the tile and the gap is
    one clearspace unit, so both lockups share a rhythm.

    The tile is a solid rounded square, not the outlined sharp one it used to
    be: a hard-cornered box with a 45% hairline both dated the lockup and
    contradicted the radius scale every other surface follows. Cropping in on
    the knot (TILE_CROP) is what makes the S legible at lockup size — the full
    bleeding tile turns into a grey slash.
    """
    tile = 400.0
    cap = tile * 0.30
    gap = tile * 0.30
    k = tile / TILE * TILE_CROP
    mark = sscale(mark_geom(), k, k, origin=(0, 0))
    # re-centre the enlarged mark on the tile
    mb = mark.bounds
    mark = translate(mark, (tile - (mb[2] - mb[0])) / 2 - mb[0],
                     (tile - (mb[3] - mb[1])) / 2 - mb[1])

    from svgpathtools import parse_path
    wd, ww = wordmark_at(cap)
    wx0, wy0 = 0.0, 0.0
    if stacked:
        # The wordmark is wider than the tile, so it sets the width and the
        # tile centres over it — not the other way round.
        vb_w, vb_h = max(tile, ww), tile + gap + cap
        mark = translate(mark, (vb_w - tile) / 2, 0)
        wdx, wdy = (vb_w - ww) / 2, tile + gap
        tile_x = (vb_w - tile) / 2
    else:
        wdx, wdy = tile + gap, (tile - cap) / 2
        vb_w, vb_h = tile + gap + ww, tile
        tile_x = 0.0

    pad = tile * CLEAR
    mark = translate(mark, pad, pad)
    wd = parse_path(wd).translated(complex(wdx + pad, wdy + pad)).d()
    vb = (0, 0, round(vb_w + 2 * pad), round(vb_h + 2 * pad))
    return vb, mark, wd, (pad + tile_x, pad, tile)


def build_lockups():
    """Mark tile plus wordmark, on a solid rounded tile.

    Note this shows the mark twice — once in the tile, once as the S of the
    word — because the S *is* the mark. That is deliberate here: the tile gives
    the lockup a square avatar form the wordmark alone cannot. Use the bare
    wordmark wherever that repetition is not wanted.
    """
    for stacked, name in ((False, "horizontal"), (True, "stacked")):
        vb, mark, wd, (tx, ty, tile) = _lockup(stacked)
        r = tile * TILE_RADIUS
        sq = f'x="{tx}" y="{ty}" width="{tile}" height="{tile}" rx="{r:.1f}"'
        clip = f'    <clipPath id="tile"><rect {sq}/></clipPath>'
        ribbon = f'  <g clip-path="url(#tile)" fill="{{fill}}"><path d="{path_d(mark)}"/></g>'
        word = f'  <path d="{wd}" fill="{{fill}}"/>'

        write(f"silver-lockup-{name}.svg",
              svg(vb, (f'  <rect {sq} fill="#15171B"/>\n' + ribbon + "\n" + word)
                  .format(fill="url(#foil)"),
                  defs=foil_def(vb) + "\n" + clip,
                  title=f"Silver lockup, {name}"))

        # One-colour: no tile fill to invert against, so the ribbon carries it
        # alone and the rounded crop is implied by the clip.
        for tone, hexv in (("white", "#FFFFFF"), ("black", "#000000")):
            write(f"silver-lockup-{name}-mono-{tone}.svg",
                  svg(vb, (ribbon + "\n" + word).format(fill=hexv),
                      defs=clip, title=f"Silver lockup, {name}"))


ICON_VB = (392, 392, 416, 416)   # cropped to the S, with the bands entering


def build_s():
    """The S alone — the same shape the wordmark uses, as its own file.

    One definition, one asset: anything that needs just the letter takes this
    rather than rebuilding it.
    """
    from silver_wordmark import glyph
    g = glyph("S")
    b = g.bounds
    g = translate(g, -b[0], -b[1])
    w, h = round(b[2] - b[0], 1), round(b[3] - b[1], 1)
    vb = (0, 0, w, h)
    d = path_d(g)
    write("silver-s.svg",
          svg(vb, f'  <path d="{d}" fill="url(#foil)"/>',
              defs=foil_def(vb), title="Silver S"))
    write("silver-s-mono-white.svg",
          svg(vb, f'  <path d="{d}" fill="#FFFFFF"/>', title="Silver S"))
    write("silver-s-mono-black.svg",
          svg(vb, f'  <path d="{d}" fill="#000000"/>', title="Silver S"))


def verify_s_is_the_mark():
    """Fail the build if the wordmark's S ever stops being the mark.

    This regressed once: a stray `scale: 0.50` in a second S code path made the
    lockups carry a different letter from the logo, and nothing noticed. The
    check rebuilds the expected letter independently — straight from
    `mark_geometry()` at the committed config — and compares it against what
    silver_wordmark actually produces. A changed parameter in either place
    shows up as a mismatch.
    """
    from shapely.affinity import rotate as rot, scale as sc2
    from shapely.geometry import box as bx
    from silver_logo import knot_geometry, mark_geometry
    from silver_wordmark import STUB, glyph, H as CAP_H

    whole = rot(mark_geometry(clip_tile=False), BASE_ANGLE, origin=(600, 600))
    core = rot(knot_geometry(), BASE_ANGLE, origin=(600, 600))
    k = CAP_H / (core.bounds[3] - core.bounds[1])
    whole = sc2(whole, k, k, origin=(0, 0))
    core = sc2(core, k, k, origin=(0, 0))
    cb = core.bounds
    whole = translate(whole, -cb[0], -cb[1])
    core = translate(core, -cb[0], -cb[1])
    cb = core.bounds
    expected = whole.intersection(bx(cb[0] - STUB, -CAP_H, cb[2] + STUB, 2 * CAP_H))
    expected = translate(expected, -expected.bounds[0], 0)
    expected = expected.intersection(bx(-500, 0, 500, CAP_H))

    actual = glyph("S")
    diff = expected.symmetric_difference(actual).area / expected.area
    if diff > 1e-9:
        raise SystemExit(
            f"[S DRIFT] the wordmark's S no longer matches the mark built from "
            f"the committed config ({diff:.3%} of its area differs).")
    print("   S matches the mark exactly (checked against the config)")


def build_icon(name, title):
    """At 16 or 32px the full tile collapses into a grey dash — the S is only
    23% of it. The icon crops to the knot, so the bands read as corners and
    the S carries the shape."""
    vb = ICON_VB
    clip = (f'    <clipPath id="t"><rect x="{vb[0]}" y="{vb[1]}"'
            f' width="{vb[2]}" height="{vb[3]}"/></clipPath>')
    body = (f'  <g clip-path="url(#t)" fill="url(#foil)">'
            f'<path d="{path_d(mark_geom())}"/></g>')
    write(name, svg(vb, body, defs=foil_def(vb) + "\n" + clip,
                    bg="#15171B", title=title))


def build_pngs():
    """Rasterise the SVGs with headless Chromium.

    The PNGs are rendered *from the SVG files* rather than re-drawn through a
    second pipeline. There used to be a separate Pillow path that composited a
    photographic foil; it drifted the moment the SVG foil became a repeating
    gradient, and a logo that differs between its own PNG and SVG is a bug
    waiting to be shipped.
    """
    import shutil
    import subprocess

    png = os.path.join(OUT, "png")
    os.makedirs(png, exist_ok=True)

    chrome = os.environ.get("CHROME") or os.path.expanduser(
        "~/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome")
    if not os.path.exists(chrome):
        chrome = shutil.which("chromium") or shutil.which("google-chrome")
    if not chrome:
        print("  ! no Chromium found — skipping PNG export (set CHROME)")
        return

    jobs = [
        ("silver-mark.svg", "silver-mark-2400.png", 2400),
        ("silver-icon.svg", "silver-icon-1024.png", 1024),
        ("silver-icon.svg", "discord-avatar-512.png", 512),
        ("silver-lockup-horizontal.svg", "silver-lockup-horizontal-2000.png", 2000),
        ("silver-lockup-stacked.svg", "silver-lockup-stacked-2000.png", 2000),
        ("silver-wordmark.svg", "silver-wordmark-2000.png", 2000),
    ]
    for src, dst, width in jobs:
        path = os.path.join(OUT, src)
        vb = re.search(r'viewBox="([^"]+)"', open(path).read()).group(1).split()
        w, h = float(vb[2]), float(vb[3])
        height = max(1, round(width * h / w))
        html = os.path.join(png, ".shot.html")
        with open(html, "w") as f:
            f.write(f'<body style="margin:0"><img src="file://{path}" '
                    f'style="width:{width}px;height:{height}px;display:block"></body>')
        subprocess.run(
            [chrome, "--headless", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
             f"--window-size={width},{height}", "--default-background-color=00000000",
             "--virtual-time-budget=4000",
             f"--screenshot={os.path.join(png, dst)}", f"file://{html}"],
            check=True, capture_output=True)
        print("  ", os.path.relpath(os.path.join(png, dst), ROOT))
    os.remove(html)


def build_manifest():
    """What each file is for — so nobody has to open ten SVGs to find out."""
    man = {
        "silver-mark.svg": "Primary mark on Graphite. Square, full bleed.",
        "silver-mark-transparent.svg": "Mark with no background. Place on Void or Graphite only.",
        "silver-mark-mono-white.svg": "Single colour, for dark print, embroidery, stamps.",
        "silver-mark-mono-black.svg": "Single colour, for light print and faxed documents.",
        "silver-wordmark.svg": "SILVER set on its own. Use where the mark already appears.",
        "silver-lockup-horizontal.svg": "Default lockup. Headers, letterheads, banners.",
        "silver-lockup-stacked.svg": "Lockup for narrow or square spaces.",
        "favicon.svg": "Browser tab.",
        "png/discord-avatar-512.png": "Discord server icon and any square avatar.",
    }
    with open(os.path.join(OUT, "manifest.json"), "w") as f:
        json.dump(man, f, indent=2)
        f.write("\n")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    print("logo/")
    verify_s_is_the_mark()
    build_mark()
    build_s()
    build_wordmark()
    build_lockups()
    build_icon("favicon.svg", "Silver")
    build_icon("silver-icon.svg", "Silver icon")
    build_pngs()
    build_manifest()
