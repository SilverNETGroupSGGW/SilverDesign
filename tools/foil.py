"""The foil ramp — the one place silver is defined.

The reference photo is a beautiful surface but a terrible fill: its dark end
falls below the page background, so anything sitting there disappears. So the
foil is rebuilt as two separable parts:

  * a controlled luminance ramp along the brand angle, with a floor bright
    enough to stay legible on Void
  * the photo's grain only — its own large-scale gradient divided out

Both are mirrored in brand/tokens.css so screen and print agree.
"""

import math

from PIL import Image, ImageFilter

BASE_ANGLE = 27.07
TEXTURE = "/var/home/orcho/Projects/SilverDesign/brand/foil-texture.jpg"

# position along the 27.07 deg axis -> hex. Two highlights and a shadow
# between them: a single linear fade reads as plastic, not metal.
RAMP = [
    (0.00, "#5C6067"),
    (0.24, "#9FA3AA"),
    (0.46, "#EFF1F4"),
    (0.63, "#A8ACB3"),
    (0.82, "#6F737A"),
    (1.00, "#CDD0D5"),
]

# Same ramp with the floor lifted, for small text and thin rules where the
# dark end would otherwise close up.
RAMP_BRIGHT = [
    (0.00, "#7E828A"),
    (0.26, "#C9CCD1"),
    (0.50, "#FFFFFF"),
    (0.72, "#C0C4CA"),
    (1.00, "#E8EAED"),
]


def _hex(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def _lerp(ramp, t):
    t = min(max(t, 0.0), 1.0)
    for i in range(len(ramp) - 1):
        p0, c0 = ramp[i]
        p1, c1 = ramp[i + 1]
        if t <= p1:
            f = 0 if p1 == p0 else (t - p0) / (p1 - p0)
            a, b = _hex(c0), _hex(c1)
            return tuple(round(a[j] + (b[j] - a[j]) * f) for j in range(3))
    return _hex(ramp[-1][1])


def gradient(size, ramp=RAMP, angle=BASE_ANGLE):
    """Linear ramp along the brand angle, bright end toward the upper right."""
    import numpy as np

    w, h = size
    th = math.radians(angle)
    ux, uy = math.cos(th), -math.sin(th)          # up-and-right, y grows down
    xs = np.arange(w)[None, :] * ux
    ys = np.arange(h)[:, None] * uy
    t = xs + ys
    t = (t - t.min()) / (t.max() - t.min() or 1)

    lut = np.array([_lerp(ramp, i / 255) for i in range(256)], dtype=np.uint8)
    return Image.fromarray(lut[(t * 255).astype(np.uint8)], "RGB")


def grain(size, source=TEXTURE, strength=0.5):
    """The photo's texture with its own lighting divided out, centred on 128."""
    import numpy as np

    tex = Image.open(source).convert("L").resize(size, Image.LANCZOS)
    flat = tex.filter(ImageFilter.GaussianBlur(max(size) / 24))
    a = np.asarray(tex, dtype=np.float32)
    b = np.asarray(flat, dtype=np.float32) + 1e-6
    g = 128 + (a - b) * strength * 2.2
    return Image.fromarray(np.clip(g, 0, 255).astype(np.uint8), "L")


def foil(size, ramp=RAMP, angle=BASE_ANGLE, grain_strength=0.5):
    """Ramp + grain, combined the way an overlay blend would."""
    import numpy as np

    base = np.asarray(gradient(size, ramp, angle), dtype=np.float32) / 255
    g = np.asarray(grain(size, strength=grain_strength), dtype=np.float32)[..., None] / 255
    out = np.where(base < 0.5, 2 * base * g, 1 - 2 * (1 - base) * (1 - g))
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), "RGB")
