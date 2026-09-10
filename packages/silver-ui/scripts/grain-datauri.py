"""Print brand/grain.png as a data URI, small enough to inline into CSS.

The grain is monochrome noise laid over surfaces at 14% opacity, so it costs
nothing visually to drop it to 200px and 16 grey levels — and that takes the
file from 279KB to 16KB, which is the difference between an inlinable asset
and one every design would have to fetch.
"""

import base64
import io
import os

from PIL import Image

SIZE = 200
LEVELS = 16

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "brand", "grain.png")

im = Image.open(src).convert("L").resize((SIZE, SIZE), Image.LANCZOS)
im = im.quantize(colors=LEVELS, method=Image.MEDIANCUT)

buf = io.BytesIO()
im.save(buf, "PNG", optimize=True)
print("data:image/png;base64," + base64.b64encode(buf.getvalue()).decode())
