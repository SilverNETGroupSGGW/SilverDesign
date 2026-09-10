"""Compose SILVER from the mark's S plus ILVER outlined from a real typeface.

Why outline rather than set live text:

  * A logo must not depend on a font being installed. Outlines make the
    wordmark the same kind of artifact as the mark — pure geometry.
  * Matching heights is otherwise guesswork. `font-size` is the em; cap height
    is only ~0.70 of it and differs per family, so sizing the S to the text's
    font-size leaves the S visibly taller. Scaling each font by its own
    reported cap height makes the two match exactly.

The glyph outlines stay **native SVG path data** — curves intact. An earlier
version flattened them into shapely polygons to compose the word, which put
notches in the straight-sided letters and holes in the R: sampling a curve and
then unioning is lossy, and there is no reason to do it when SVG can fill the
real contours with the nonzero rule the font already assumes.

Cap height is 100 units, matching tools/silver_wordmark.py, so the S drops in
unchanged.
"""

import os
import re
import sys

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from silver_wordmark import H, TRACK, glyph, path_d  # noqa: E402

LETTERS = "ILVER"

# The chosen face. Its stem is 0.166 of cap height — identical to the S's
# stroke — so the two sit together with no weight adjustment, and its O is
# 0.97 wide-to-tall: soft without being a circle. Terminals are cut flat.
FIGTREE = os.path.join(HERE, "fonts", "figtree-600-latin.woff2")


def cap_height(font):
    """The font's own cap height in em units. OS/2 when reported, else the
    flat top of a capital I — which is what cap height means anyway."""
    os2 = font.get("OS/2")
    if os2 is not None and getattr(os2, "sCapHeight", 0):
        return os2.sCapHeight
    gs = font.getGlyphSet()
    bp = BoundsPen(gs)
    gs[font.getBestCmap()[ord("I")]].draw(bp)
    return bp.bounds[3]


def letter_paths(font_path, letters=LETTERS):
    """[(char, svg_path_d, advance, left_side_bearing)] on a 100-unit cap
    height, in SVG orientation (y down, baseline at y = H)."""
    font = TTFont(font_path)
    cap = cap_height(font)
    k = H / cap
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    hmtx = font["hmtx"]

    out = []
    for ch in letters:
        name = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[name].draw(pen)
        d = pen.getCommands()
        bp = BoundsPen(gs)
        gs[name].draw(bp)
        xmin = bp.bounds[0] if bp.bounds else 0
        advance = hmtx[name][0] * k
        out.append((ch, d, advance, xmin * k))
    font.close()
    return out, k


def wordmark_svg(font_path=FIGTREE, track=TRACK, fill="url(#foil)",
                 tight=True, cap=H):
    """The wordmark as ONE path in one coordinate space, at `cap` cap height.

    The transforms are baked into the path data rather than applied with
    `<g transform>`. That is not tidiness: a `userSpaceOnUse` gradient resolves
    in the user space in effect where it is referenced, ancestor transforms
    included, so a per-letter `<g transform>` makes every letter sample the
    gradient from its own origin — the foil then reads as applied letter by
    letter instead of as one continuous sheet across the word.

    """
    from svgpathtools import parse_path

    s = glyph("S")
    sb = s.bounds
    parts = [path_d(s)]

    letters, k = letter_paths(font_path)
    x = sb[2] + track
    if tight:
        x -= letters[0][3]          # sit the first letter's ink at the gap

    for _ch, d, advance, _lsb in letters:
        # font y grows up, SVG y grows down: flip about the baseline, then place
        parts.append(parse_path(d).scaled(k, -k).translated(complex(x, H)).d())
        x += advance

    width = _ink_right(font_path, letters[-1][0], k, x - letters[-1][2])

    combined = " ".join(parts)
    if cap != H:
        scale = cap / H
        combined = parse_path(combined).scaled(scale, scale).d()
        width *= scale
    return combined, width


def _ink_right(font_path, ch, k, pen_x):
    """Right edge of the last letter's ink, so the lockup has no dead space."""
    font = TTFont(font_path)
    gs = font.getGlyphSet()
    bp = BoundsPen(gs)
    gs[font.getBestCmap()[ord(ch)]].draw(bp)
    font.close()
    return pen_x + bp.bounds[2] * k


def svg_document(font_path=FIGTREE, track=TRACK, pad=18.0, bg="#15171B",
                 foil=True):
    """A complete SVG with **no transforms anywhere** — the padding is a
    negative viewBox origin instead of a wrapping `<g transform>`, for the same
    reason the letters are baked: any transform between the gradient and the
    geometry moves the sheet with it."""
    from build_logo import foil_def
    d, w = wordmark_svg(font_path, track)
    fill = "url(#foil)" if foil else "#E6E8EC"
    vb = (-pad, -pad, round(w + 2 * pad, 1), round(H + 2 * pad, 1))
    defs = f"\n  <defs>\n{foil_def(vb)}\n  </defs>" if foil else ""
    rect = (f'\n  <rect x="{vb[0]}" y="{vb[1]}" width="{vb[2]}" height="{vb[3]}"'
            f' fill="{bg}"/>') if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg"'
            f' viewBox="{vb[0]} {vb[1]} {vb[2]} {vb[3]}"'
            f' width="{vb[2]}" height="{vb[3]}">{defs}{rect}\n'
            f'  <path d="{d}" fill="{fill}"/>\n</svg>\n')


if __name__ == "__main__":
    for p in sys.argv[1:]:
        _, w = wordmark_svg(p)
        print(f"{os.path.basename(p):22} width {w:7.1f}")
