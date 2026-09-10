"""Rasterize the Silver mark with the metallic texture, for visual checking."""

import sys
from PIL import Image, ImageDraw, ImageEnhance

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from silver_logo import SILVER, build  # noqa: E402

TEX = "/var/home/orcho/Downloads/side-lit-matte-metallic-texture.webp"
SS = 3  # supersample


def render(P=SILVER, size=1200, bg="#15171b", texture=TEX, transparent=False):
    S = size * SS
    g = build(P)
    mask = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(mask)
    k = S / 1200
    for key in ("bandTop", "bandBot", "sPath"):
        d.polygon([(x * k, y * k) for x, y in g[key]], fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)

    tex = Image.open(texture).convert("RGB").resize((size, size), Image.LANCZOS)
    tex = ImageEnhance.Brightness(tex).enhance(P.get("brightness", 1.0))

    if transparent:
        out = tex.convert("RGBA")
        out.putalpha(mask)
    else:
        out = Image.new("RGB", (size, size), bg)
        out.paste(tex, (0, 0), mask)
    return out


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "/tmp/silver.png"
    render().save(out)
    print(out)
