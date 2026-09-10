"""Generate brand/grain.png — the matte-metal texture.

Two things this got wrong before, both worth stating so they are not repeated:

1. **It was streaked far too hard.** A long motion blur along the brand angle
   produced visible parallel lines — combed hair, not metal. Measuring the
   reference photo settled it: its own high-frequency grain is essentially
   isotropic (directional energy ratio 1.03) and fine. The material is matte,
   near-sandblasted, not brushed. So the noise here is isotropic with only a
   slight bias along the brand angle — enough to nod to it, far too little to
   read as lines.

2. **It has to tile seamlessly.** The noise is band-limited with an FFT, which
   is periodic by construction, so the tile wraps exactly. A spatial blur does
   not: it pulls in values from outside the tile and leaves a visible join.
   The check at the bottom compares the wrap edges against the interior — they
   should be statistically indistinguishable.

Run: python3 tools/make_grain.py && python3 tools/inline_grain.py
"""

import math
import os

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "brand", "grain.png")

SIZE = 256
BASE_ANGLE = 27.07
BAND_LO, BAND_HI = 18, 64   # cycles across the tile: fine, not clumpy
ANISO = 1.6                 # 1.0 = isotropic; keep low or it reads as lines
CONTRAST = 38.0             # std in 0-255; ~8 was invisible under any blend
SEED = 5


def build():
    rng = np.random.default_rng(SEED)
    spectrum = np.fft.fft2(rng.standard_normal((SIZE, SIZE)))

    fy = np.fft.fftfreq(SIZE)[:, None] * SIZE
    fx = np.fft.fftfreq(SIZE)[None, :] * SIZE
    th = math.radians(BASE_ANGLE)
    along = fx * math.cos(th) + fy * math.sin(th)
    across = -fx * math.sin(th) + fy * math.cos(th)
    r = np.hypot(along / ANISO, across * ANISO)

    centre = (BAND_LO + BAND_HI) / 2
    width = (BAND_HI - BAND_LO) / 2.5
    band = np.exp(-((r - centre) ** 2) / (2 * width**2))

    out = np.real(np.fft.ifft2(spectrum * band))
    return out / out.std()


def main():
    a = build()
    img = np.clip(128 + a * CONTRAST, 0, 255).astype(np.uint8)
    Image.fromarray(img, "L").save(OUT, optimize=True)

    f = img.astype(float)
    seam_x = np.abs(f[:, 0] - f[:, -1]).mean()
    seam_y = np.abs(f[0, :] - f[-1, :]).mean()
    interior = np.abs(np.diff(f, axis=1)).mean()
    print(f"{os.path.relpath(OUT, ROOT)}: {SIZE}px, std {f.std():.1f}")
    print(f"  wrap seam x {seam_x:.2f}, y {seam_y:.2f} vs interior {interior:.2f}"
          f"  -> {'seamless' if max(seam_x, seam_y) < interior * 1.25 else 'SEAM'}")


if __name__ == "__main__":
    main()
