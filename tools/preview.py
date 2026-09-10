"""Rasterise shapely geometry through the foil texture, for eyeballing."""

import sys
from PIL import Image, ImageDraw, ImageEnhance
from shapely.geometry import Polygon

sys.path.insert(0, __file__.rsplit("/", 1)[0])

TEX = "/var/home/orcho/Downloads/side-lit-matte-metallic-texture.webp"
SS = 3


def mask_of(geom, size, box):
    """box = (x0, y0, x1, y1) in geometry units, mapped to a `size` canvas."""
    W, Hpx = size
    x0, y0, x1, y1 = box
    k = W / (x1 - x0)
    m = Image.new("L", (W * SS, Hpx * SS), 0)
    d = ImageDraw.Draw(m)
    T = lambda pts: [((x - x0) * k * SS, (y - y0) * k * SS) for x, y in pts]
    polys = geom.geoms if hasattr(geom, "geoms") else [geom]
    for p in polys:
        if not isinstance(p, Polygon):
            continue
        d.polygon(T(p.exterior.coords), fill=255)
        for r in p.interiors:
            d.polygon(T(r.coords), fill=0)
    return m.resize((W, Hpx), Image.LANCZOS)


def fit(geom, width=1600, pad=0.08, bg="#15171b", ramp=None):
    """Render geom into a canvas sized to its own bounds, with padding."""
    x0, y0, x1, y1 = geom.bounds
    m = (x1 - x0) * pad
    box = (x0 - m, y0 - m, x1 + m, y1 + m)
    h = round(width * (box[3] - box[1]) / (box[2] - box[0]))
    return render(geom, box, (width, h), bg, ramp)


def render(geom, box, size=(1600, 400), bg="#15171b", ramp=None):
    from foil import RAMP, foil
    out = Image.new("RGB", size, bg)
    out.paste(foil(size, ramp or RAMP), (0, 0), mask_of(geom, size, box))
    return out
