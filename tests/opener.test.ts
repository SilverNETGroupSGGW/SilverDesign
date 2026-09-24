import { describe, expect, test } from "bun:test";
import {
  aboveBoundary,
  backdropVariants,
  belowBoundary,
  body,
  evalForm,
  exits,
  lockupBox,
  openerLayouts,
  openerSizes,
  openerStyle,
  polygonCss,
  rootFontSize,
  shapeAbove,
  shapeBelow,
  sizeCss,
  tan,
  unroll,
  wordEndPoint,
} from "../src/lib/opener";
import { tipSpan, unrollSpan } from "../src/lib/unroll-span";

/** The viewports the opener's sizes are checked at. */
// 980 and 1000 sit on both sides of the 56rem breakpoint, where the narrow floor is tightest.
const WIDTHS = [400, 768, 980, 1000, 1024, 1440, 1920, 2560];
/** A stand-in window height: no size reads one any more. */
const WINDOW_H = 400;

const overlaps = (a: [number, number], b: [number, number]): boolean => a[0] < b[1] && b[0] < a[1];

describe("the opener's construction", () => {
  test("the boundaries run from the left edge to the top, around the S and the word", () => {
    expect(aboveBoundary).toHaveLength(6);
    expect(belowBoundary).toHaveLength(7);
    // Both leave through the top: a point past the right edge is clipped by the float's box, so one
    // polygon serves the widths where the ribbon leaves through the right edge too.
    expect(aboveBoundary.at(-1)![1]).toEqual(expect.objectContaining({ px: 0, m: 0, by: 0 }));
    expect(belowBoundary.at(-1)![1]).toEqual(expect.objectContaining({ px: 0, m: 0, by: 0 }));
    expect(shapeAbove).toHaveLength(9);
    expect(shapeBelow).toHaveLength(8);
  });

  test("the S body is the fraction of the mark box the lockup was fitted to", () => {
    expect(body.w).toBeCloseTo(0.5053, 4);
    expect(body.h).toBeCloseTo(0.538, 4);
    expect(tan).toBeCloseTo(Math.tan((26.17 * Math.PI) / 180), 4);
  });

  test("every point is a calc() of the opener's own properties", () => {
    for (const points of [shapeAbove, shapeBelow]) {
      const css = polygonCss(points);
      expect(css.startsWith("polygon(")).toBe(true);
      // calc() has no unary minus on a var(): "-var(--x)" makes the whole polygon invalid, and an
      // invalid shape fails silently as a full-width float.
      expect(css).not.toContain("-var(");
      expect(css).not.toContain("+ -");
    }
  });

  test("a size is written as the CSS it is evaluated as", () => {
    expect(sizeCss({ clamp: [{ rem: 2 }, { cqw: 4.4 }, { rem: 3.6 }] })).toBe(
      "clamp(2rem, 4.4cqw, 3.6rem)",
    );
    expect(sizeCss({ by: 1, m: body.h, g: 2 })).toBe(
      "calc(0.538 * var(--m) + var(--by) + 2 * var(--g))",
    );
    expect(openerStyle(openerLayouts.home)).toContain("--m:clamp(");
  });
});

describe("the ribbon never ends inside the opener", () => {
  for (const variant of ["home", "page"] as const) {
    const layout = openerLayouts[variant];
    for (const w of WIDTHS) {
      // A subpage title is one line; the home title is three on the narrowest phone.
      const v = openerSizes(layout, { w, h: WINDOW_H, titleLines: variant === "page" ? 1 : 3 });
      const rem = rootFontSize(w);
      const backdrop = backdropVariants.has(variant);
      const e = exits(v, backdrop);

      test(`${variant} at ${w}: the lower arm leaves through the left edge`, () => {
        // A backdrop's ribbon runs on under the page's content, so it only has to reach the left
        // edge below the top; the wrapping variants clip it, so it has to get there inside the box.
        if (!backdrop) expect(e.leftBottom).toBeLessThan(v.h - rem);
        expect(e.leftTop).toBeGreaterThan(0);
      });

      test(`${variant} at ${w}: the upper arm leaves through the top or the right edge`, () => {
        // One edge of the band may cross the top past the right corner, as long as it then leaves
        // through the right edge above the opener's bottom.
        // A backdrop's box ends with its copy, so a right exit only has to be below the top.
        const leaves = (topX: number, rightY: number): boolean =>
          topX <= w ? topX > 0 : rightY > 0 && (backdrop || rightY < v.h - rem);
        expect(leaves(e.topStart, e.rightTop)).toBe(true);
        expect(leaves(e.topEnd, e.rightBottom)).toBe(true);
      });

      test(`${variant} at ${w}: the word stays on screen`, () => {
        if (backdrop) return;
        expect(wordEndPoint(v)[0]).toBeLessThanOrEqual(0.95 * w);
        // In y as well as in x: the word is the one part of the composition that may not leave
        // through an edge, and the opener clips it.
        expect(evalForm(lockupBox.origin[1], v)).toBeGreaterThanOrEqual(v.g);
      });

      test(`${variant} at ${w}: the navigation's box is clear of the foil`, () => {
        // On a page the lockup is a dimmed backdrop the copy stands on, so the foil may run under
        // the navigation; the S itself still keeps clear of it (next test).
        if (backdrop) return;
        const nav = {
          x: [v.aboveX, v.aboveX + v.navW] as [number, number],
          y: [v.navTop, v.navTop + v.navH] as [number, number],
        };
        // Both bands, where they reach highest inside the nav's box: its right edge. The upper arm
        // is taken as a full line, which is stricter than the drawn arm, since that one starts at
        // the S.
        const at = nav.x[1];
        const lower: [number, number] = [e.leftTop - tan * at, e.leftBottom - tan * at];
        const upper: [number, number] = [(e.topStart - at) * tan, (e.topEnd - at) * tan];
        expect(overlaps(nav.y, lower)).toBe(false);
        expect(overlaps(nav.y, upper)).toBe(false);
      });

      test(`${variant} at ${w}: the S sits below the navigation's box`, () => {
        // A backdrop has no S, and its dimmed band may pass behind the links (an owner ruling).
        if (backdrop) return;
        expect(v.by).toBeGreaterThanOrEqual(v.navTop + v.navH + v.g);
      });

      test(`${variant} at ${w}: the lead and the navigation's offset stay capped`, () => {
        expect(v.lead).toBeLessThanOrEqual(1.35 * rem);
        expect(v.navTop).toBeLessThanOrEqual(2 * rem);
      });

      test(`${variant} at ${w}: the lead starts beside the S, below its top third`, () => {
        if (backdrop) return;
        expect(v.belowY).toBeGreaterThanOrEqual(v.by + body.h * 0.3 * v.m);
        expect(v.belowX).toBeGreaterThanOrEqual(v.aboveX);
      });
    }
  }

  test("the sheet's opener holds the whole lockup and both exits", () => {
    const v = openerSizes(openerLayouts.sheet, { w: 1240, h: 1754, rem: 22 });
    const e = exits(v);
    expect(e.leftBottom).toBeLessThan(v.h - 22);
    expect(e.throughTop).toBe(true);
    expect(e.topEnd).toBeLessThanOrEqual(1240);
    expect(wordEndPoint(v)[0]).toBeLessThanOrEqual(0.95 * 1240);
    // A sheet is printed: the word may not be cut by the sheet's top edge.
    expect(evalForm(lockupBox.origin[1], v)).toBeGreaterThanOrEqual(v.g);
  });
});

describe("the home page's unroll", () => {
  const [dx, dy] = unroll.dir;
  const n = [-dy, dx] as const;
  const along = (p: readonly number[]): number =>
    (p[0]! - unroll.centre[0]) * dx + (p[1]! - unroll.centre[1]) * dy;
  const acrossOf = (p: readonly number[]): number =>
    (p[0]! - unroll.centre[0]) * n[0] + (p[1]! - unroll.centre[1]) * n[1];
  const spine = unroll.spinePath
    .slice(2)
    .split(" L ")
    .map((q) => q.split(" ").map(Number));
  const edges = { left: -400, right: 1700, top: -250 };
  const { from, to } = unrollSpan(unroll, edges);

  test("its tip is square to the band", () => {
    expect(Math.tan((-unroll.angle * Math.PI) / 180)).toBeCloseTo(tan, 6);
  });
  test("starts where the lower arm first shows over the left edge", () => {
    const s = from - along(unroll.lower);
    const onEdge = (w: number): number => unroll.lower[0] + s * dx + w * n[0];
    expect(onEdge(unroll.half)).toBeCloseTo(edges.left, 6);
    expect(onEdge(-unroll.half)).toBeLessThan(edges.left);
  });
  test("stops past the word and past the last of the upper arm inside the box", () => {
    expect(to).toBeGreaterThanOrEqual(unroll.wordEnd);
    const s = to - along(unroll.upper);
    for (const w of [-unroll.half, unroll.half]) {
      const x = unroll.upper[0] + s * dx + w * n[0];
      const y = unroll.upper[1] + s * dy + w * n[1];
      expect(x >= edges.right - 1e-6 || y <= edges.top + 1e-6).toBe(true);
    }
  });
  test("the tip's path runs up the lower arm, along the spine, then out along the upper arm", () => {
    const tip = tipSpan(unroll, edges);
    expect(tip.from).toBeCloseTo(from - along(unroll.lower), 9);
    expect(tip.to).toBeCloseTo(unroll.spineLength + to - along(unroll.upper), 9);
    expect(along(spine[0]!)).toBeCloseTo(along(unroll.lower), 1);
    expect(along(spine.at(-1)!)).toBeCloseTo(along(unroll.upper), 1);
  });
  // Each reveal stroke may only uncover its own part: an arm stroke stops square at its joint, so
  // the S has to lie on the far side of it, and the word's lane has to be clear of the S.
  test("no part of the S lies inside an arm's stroke or the word's lane", () => {
    const reach = unroll.half + 8 + unroll.lineWidth / 2;
    const cutLower = along(unroll.lower) - unroll.lineWidth / 2;
    const cutUpper = along(unroll.upper) + unroll.lineWidth / 2;
    for (const p of spine) {
      const a = along(p);
      const u = acrossOf(p);
      expect(a < cutLower && Math.abs(u - acrossOf(unroll.lower)) < reach).toBe(false);
      expect(a > cutUpper && Math.abs(u - acrossOf(unroll.upper)) < reach).toBe(false);
      expect(a + unroll.lineWidth / 2).toBeLessThan(unroll.wordStart - 8);
    }
  });
});
