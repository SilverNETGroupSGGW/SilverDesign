"""Rewrite the --grain token in brand/tokens.css with an inlined data URI.

Why this has to be inlined rather than a plain url('grain.png'):

A relative URL inside a CSS custom property is resolved against the *document*,
not against the stylesheet that declares the property. So `--grain:
url('grain.png')` declared in brand/tokens.css goes looking for grain.png next
to whichever HTML page is open — never next to the CSS. Every consumer would
have to drop a copy of grain.png beside every page, and the failure is silent:
the texture simply does not paint and nothing reports an error.

Inlining removes the path from the equation. The cost is ~22KB of CSS, bought
down from 279KB by dropping the tile to 200px and 16 grey levels — invisible
for monochrome noise laid over a surface at low opacity.

Run after changing brand/grain.png:  python3 tools/inline_grain.py
"""

import base64
import io
import os
import re

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
GRAIN = os.path.join(ROOT, "brand", "grain.png")
TOKENS = os.path.join(ROOT, "brand", "tokens.css")

SIZE = 256
LEVELS = 48   # enough levels to keep the streaks smooth


def data_uri():
    im = Image.open(GRAIN).convert("L").resize((SIZE, SIZE), Image.LANCZOS)
    im = im.quantize(colors=LEVELS, method=Image.MEDIANCUT)
    buf = io.BytesIO()
    im.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def main():
    uri = data_uri()
    css = open(TOKENS).read()
    new, n = re.subn(
        r"(--grain:\s*)url\([^)]*\);",
        lambda m: m.group(1) + f'url("{uri}");',
        css,
        count=1,
    )
    if not n:
        raise SystemExit("could not find the --grain declaration in tokens.css")
    open(TOKENS, "w").write(new)
    print(f"inlined grain into brand/tokens.css ({len(uri) // 1024} KB data URI)")


if __name__ == "__main__":
    main()
