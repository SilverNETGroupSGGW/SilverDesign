import geometry from "../../brand/logo/geometry.json";
import lockup from "../../brand/logo/lockup.json";
import type { UnrollFrame } from "./unroll-span";

/**
 * The opener's sizes, in px. Every point is linear in these, so one `calc()` polygon of the matching
 * custom properties serves every breakpoint, and a test can evaluate the same points as numbers.
 */
export interface OpenerVars {
  /** The mark box's side; the exported viewBox is square. */
  m: number;
  /** The S body's top-left corner in the opener's box. */
  bx: number;
  by: number;
  /** Clearance between text and foil. */
  g: number;
  /** The opener's own box. */
  w: number;
  h: number;
  /** The origin the polygon is measured from: the float's margin box, inside the zone's padding. */
  zx: number;
  zy: number;
}

export type Form = Readonly<Record<"px" | keyof OpenerVars, number>>;
export type Point = readonly [Form, Form];

const ZERO: Form = { px: 0, m: 0, bx: 0, by: 0, g: 0, w: 0, h: 0, zx: 0, zy: 0 };
const TERMS = Object.keys(ZERO) as (keyof Form)[];

const form = (parts: Partial<Form>): Form => ({ ...ZERO, ...parts });
const add = (...fs: Form[]): Form =>
  Object.fromEntries(
    TERMS.map((k) => [k, fs.reduce((sum, f) => sum + f[k], 0)]),
  ) as unknown as Form;
const mul = (f: Form, k: number): Form =>
  Object.fromEntries(TERMS.map((t) => [t, f[t] * k])) as unknown as Form;

export const evalForm = (f: Form, v: OpenerVars): number =>
  f.px +
  f.m * v.m +
  f.bx * v.bx +
  f.by * v.by +
  f.g * v.g +
  f.w * v.w +
  f.h * v.h +
  f.zx * v.zx +
  f.zy * v.zy;

const round = (n: number): number => Math.round(n * 1e5) / 1e5;
const PROP: Record<keyof OpenerVars, string> = {
  m: "--m",
  bx: "--bx",
  by: "--by",
  g: "--g",
  w: "--w",
  h: "--h",
  zx: "--zone-x",
  zy: "--zone-y",
};

export const formCss = (f: Form): string => {
  let out = "";
  for (const t of TERMS) {
    const k = round(f[t]);
    if (k === 0) continue;
    const size = Math.abs(k);
    const term = t === "px" ? `${size}px` : `${size === 1 ? "" : `${size} * `}var(${PROP[t]})`;
    // calc() has no unary minus on a var(), so a leading negative term is a subtraction from zero.
    out += out === "" ? (k < 0 ? `0px - ${term}` : term) : ` ${k < 0 ? "-" : "+"} ${term}`;
  }
  return out === "" ? "0px" : `calc(${out})`;
};

const [vbX, vbY, vbSize] = lockup.markViewBox as [number, number, number];
const [bodyX, bodyY, bodyW, bodyH] = lockup.bodyBox as [number, number, number, number];
const { direction, axis, width } = geometry.ribbon;
const dir = [direction[0]!, direction[1]!] as const;
const across = [-dir[1], dir[0]] as const;
const centre = [vbX + vbSize / 2, vbY + vbSize / 2] as const;
const twin = [2 * centre[0] - axis[0]!, 2 * centre[1] - axis[1]!] as const;

/** The system's inclination, as a slope in screen coordinates. */
export const tan = -dir[1] / dir[0];

/** The S body's size, as a fraction of the mark box. */
export const body = { w: bodyW / vbSize, h: bodyH / vbSize };

/** A point in mark user units, as a point in the opener's box. */
const at = (p: readonly [number, number]): Point => [
  add(form({ bx: 1 }), form({ m: (p[0] - bodyX) / vbSize })),
  add(form({ by: 1 }), form({ m: (p[1] - bodyY) / vbSize })),
];

const along = (base: readonly [number, number], t: number, u: number): [number, number] => [
  base[0] + dir[0] * t + across[0] * u,
  base[1] + dir[1] * t + across[1] * u,
];

/** The line through `p` at the system's inclination, solved for one coordinate given the other. */
const lineY = (p: Point, x: Form): Form => add(p[1], mul(add(x, mul(p[0], -1)), -tan));
const lineX = (p: Point, y: Form): Form => add(p[0], mul(add(p[1], mul(y, -1)), 1 / tan));

const wordCorners = ((): [number, number][] => {
  const [x, y, w, h] = lockup.wordBox as [number, number, number, number];
  return [
    [x, y],
    [x + w, y],
    [x, y + h],
    [x + w, y + h],
  ];
})();
/**
 * How far the word's outline reaches along the arm and below its centreline. Not `wordBox`: that
 * box is axis-aligned, and its corners lie well outside the rotated letters.
 */
const wordSpan = lockup.wordSpan as { along: [number, number]; across: [number, number] };
const wordStartT = wordSpan.along[0];
const wordEndT = wordSpan.along[1];
const wordOff = wordSpan.across[1];

/** The lockup's top (the word rises above the S body) as a fraction of the mark box below `by`. */
export const lockupTop = (bodyY - Math.min(bodyY, lockup.wordBox[1]!)) / vbSize;

/**
 * Each as a point its line runs through at the system's inclination. The upper arm leaves towards
 * the top right; the lower arm is its turned twin.
 */
export const edges = {
  upperTop: at(along(axis as [number, number], 0, -width / 2)),
  upperBottom: at(along(axis as [number, number], 0, width / 2)),
  lowerTop: at(along(twin, 0, -width / 2)),
  lowerBottom: at(along(twin, 0, width / 2)),
  wordBottom: at(along(axis as [number, number], 0, wordOff)),
};

const segment = (a: readonly number[], b: readonly number[]): string =>
  `M ${a.map((n) => n.toFixed(2)).join(" ")} L ${b.map((n) => n.toFixed(2)).join(" ")}`;

/** How far the unroll's arm strokes run out from the joints, past any viewport the mark scales into. */
const UNROLL_REACH = 20000;

/**
 * In mark units. The tip's position `s` runs up the lower arm to its joint (s = 0), along the S's
 * spine, and out along the upper arm from its joint (s = spineLength). `lower` and `upper` are the
 * arms' centre points at their joints; `wordStart`, `wordEnd` and `wordAcross` place the word along
 * and across the band from the mark's centre.
 */
export const unroll = ((): UnrollFrame & {
  angle: number;
  lineWidth: number;
  upperAlong: number;
  lowerArm: string;
  upperArm: string;
  spinePath: string;
  wordStart: number;
  wordAcross: [number, number];
} => {
  const t = (p: readonly [number, number]): number =>
    (p[0] - centre[0]) * dir[0] + (p[1] - centre[1]) * dir[1];
  const u = (p: readonly [number, number]): number =>
    (p[0] - centre[0]) * across[0] + (p[1] - centre[1]) * across[1];
  const upper = [axis[0]!, axis[1]!] as [number, number];
  const lower = [twin[0], twin[1]] as [number, number];
  const spine = geometry.spine.points.toReversed() as [number, number][];
  const spineLength = spine
    .slice(1)
    .reduce((sum, p, i) => sum + Math.hypot(p[0] - spine[i]![0], p[1] - spine[i]![1]), 0);
  const out = (p: readonly [number, number], k: number): [number, number] => [
    p[0] + dir[0] * k,
    p[1] + dir[1] * k,
  ];
  return {
    centre: [centre[0], centre[1]],
    dir: [dir[0], dir[1]],
    half: width / 2,
    lower,
    upper,
    spineLength,
    lineWidth: geometry.spine.lineWidth,
    upperAlong: t(upper),
    wordEnd: t(upper) + wordSpan.along[1],
    angle: (Math.atan2(dir[1], dir[0]) * 180) / Math.PI,
    lowerArm: segment(out(lower, -UNROLL_REACH), lower),
    upperArm: segment(upper, out(upper, UNROLL_REACH)),
    spinePath: `M ${spine.map((p) => p.join(" ")).join(" L ")}`,
    wordStart: t(upper) + wordSpan.along[0],
    wordAcross: [u(upper) + wordSpan.across[0], u(upper) + wordSpan.across[1]],
  };
})();

/** The lower arm stroke's length, which its dash offset counts from. */
export const UNROLL_ARM_LENGTH = UNROLL_REACH;

const ZERO_F = form({});
const W = form({ w: 1 });
const H = form({ h: 1 });
const G = form({ g: 1 });
const BX = form({ bx: 1 });
const BY = form({ by: 1 });
const bodyRight = add(BX, form({ m: body.w }), G);
const bodyBottom = add(BY, form({ m: body.h }), G);
const wordStart = at(along(axis as [number, number], wordStartT, wordOff));
const wordEnd = at(along(axis as [number, number], wordEndT, wordOff));

/** An exit past the right edge is clipped by the float's box, not wrong. */
const topExit = (line: Point): Point => [lineX(line, ZERO_F), ZERO_F];

/**
 * The line the title's lines end on: in from the left edge along the lower arm's upper edge, around
 * the S, then out along the upper arm's upper edge.
 */
export const aboveBoundary: Point[] = [
  [ZERO_F, lineY(edges.lowerTop, ZERO_F)],
  [add(BX, mul(G, -1)), lineY(edges.lowerTop, add(BX, mul(G, -1)))],
  [add(BX, mul(G, -1)), add(BY, mul(G, -1))],
  [bodyRight, add(BY, mul(G, -1))],
  [bodyRight, lineY(edges.upperTop, bodyRight)],
  topExit(edges.upperTop),
];

/**
 * The line the lead's lines start on: the lower arm's lower edge, the S's bottom, the word's bottom
 * rule, then the upper arm's lower edge.
 */
export const belowBoundary: Point[] = [
  [ZERO_F, lineY(edges.lowerBottom, ZERO_F)],
  // Along the arm's edge up to the S's bottom rule: a vertical step at the S's left would let text
  // under the arm's corner.
  [lineX(edges.lowerBottom, bodyBottom), bodyBottom],
  [add(BX, form({ m: body.w })), bodyBottom],
  [wordStart[0], lineY(edges.wordBottom, wordStart[0])],
  [wordEnd[0], lineY(edges.wordBottom, wordEnd[0])],
  [add(wordEnd[0], G), lineY(edges.upperBottom, add(wordEnd[0], G))],
  topExit(edges.upperBottom),
];

/** The float above the ribbon holds everything below its boundary; the one below, everything above. */
export const shapeAbove: Point[] = [...aboveBoundary, [W, ZERO_F], [W, H], [ZERO_F, H]];
export const shapeBelow: Point[] = [
  [ZERO_F, ZERO_F],
  [belowBoundary.at(-1)![0], ZERO_F],
  ...belowBoundary.slice(0, -1).toReversed(),
];

export const markOrigin = at([vbX, vbY]);

export const lockupBox = ((): { origin: Point; w: Form; h: Form } => {
  const xs = [bodyX, bodyX + bodyW, ...wordCorners.map((c) => c[0])];
  const ys = [bodyY, bodyY + bodyH, ...wordCorners.map((c) => c[1])];
  const x0 = Math.min(...xs);
  const y0 = Math.min(...ys);
  return {
    origin: at([x0, y0]),
    w: form({ m: (Math.max(...xs) - x0) / vbSize }),
    h: form({ m: (Math.max(...ys) - y0) / vbSize }),
  };
})();

const ORIGIN_X = form({ zx: -1 });
const ORIGIN_Y = form({ zy: -1 });

/** The polygon in the float's own coordinates: scene points less the float's margin box origin. */
export const polygonCss = (points: Point[]): string =>
  `polygon(${points
    .map(([x, y]) => `${formCss(add(x, ORIGIN_X))} ${formCss(add(y, ORIGIN_Y))}`)
    .join(", ")})`;

export const resolve = (points: Point[], v: OpenerVars): [number, number][] =>
  points.map(([x, y]) => [evalForm(x, v), evalForm(y, v)]);

/** Where the ribbon leaves the opener's box: the left edge low, the top edge (or right edge) high. */
export const exits = (
  v: OpenerVars,
  band = false,
): {
  leftTop: number;
  leftBottom: number;
  topStart: number;
  topEnd: number;
  rightTop: number;
  rightBottom: number;
  throughTop: boolean;
} => {
  const at0 = (line: Point): number => evalForm(lineY(line, ZERO_F), v);
  const atW = (line: Point): number => evalForm(lineY(line, W), v);
  const xAt0 = (line: Point): number => evalForm(lineX(line, ZERO_F), v);
  return {
    leftTop: at0(band ? edges.upperTop : edges.lowerTop),
    leftBottom: at0(band ? edges.upperBottom : edges.lowerBottom),
    topStart: xAt0(edges.upperTop),
    topEnd: xAt0(edges.upperBottom),
    rightTop: atW(edges.upperTop),
    rightBottom: atW(edges.upperBottom),
    throughTop: xAt0(edges.upperTop) <= v.w,
  };
};

/** The word's far end, which has to stay on screen. */
export const wordEndPoint = (v: OpenerVars): [number, number] => [
  evalForm(wordEnd[0], v),
  evalForm(wordEnd[1], v),
];

/* Sizes are data so the component's custom properties and the invariant test read the same numbers. */

const SIZE_UNITS = ["px", "rem", "cqw", "svh", "m", "bx", "by", "g", "tb"] as const;
type SizeUnit = (typeof SIZE_UNITS)[number];
type Terms = Partial<Record<SizeUnit, number>>;
export type Size =
  | Terms
  | { sum: Size[] }
  | { min: Size[] }
  | { max: Size[] }
  | { clamp: [Size, Size, Size] }
  /** Two values, one per side of the opener's narrow breakpoint (a container query, not a calc). */
  | { wide: Size; narrow: Size };

/**
 * Below this container width the title takes the whole width and the lockup sits under it. As low
 * as 56rem (~990px) because a 1024 laptop still fits a three-line title beside the S, and the copy
 * wrapping along the ribbon is the composition: it should show on every screen that can hold it.
 */
export const NARROW_REM = 56;

export interface SizeContext extends Record<SizeUnit, number> {
  px: 1;
  narrow: boolean;
}

const VAR: Partial<Record<SizeUnit, string>> = {
  m: "--m",
  bx: "--bx",
  by: "--by",
  g: "--g",
  tb: "--title-band",
};

export const sizeValue = (s: Size, c: SizeContext): number => {
  if ("wide" in s) return sizeValue(c.narrow ? s.narrow : s.wide, c);
  if ("sum" in s) return s.sum.reduce((total, x) => total + sizeValue(x, c), 0);
  if ("min" in s) return Math.min(...s.min.map((x) => sizeValue(x, c)));
  if ("max" in s) return Math.max(...s.max.map((x) => sizeValue(x, c)));
  if ("clamp" in s) {
    const [lo, mid, hi] = s.clamp;
    return Math.min(Math.max(sizeValue(mid, c), sizeValue(lo, c)), sizeValue(hi, c));
  }
  return SIZE_UNITS.reduce((sum, u) => sum + (s[u] ?? 0) * c[u], 0);
};

export const sizeCss = (s: Size): string => {
  if ("wide" in s)
    throw new Error("a wide/narrow size is written as two properties, not one calc()");
  if ("sum" in s) return `calc(${s.sum.map(sizeCss).join(" + ")})`;
  if ("min" in s) return `min(${s.min.map(sizeCss).join(", ")})`;
  if ("max" in s) return `max(${s.max.map(sizeCss).join(", ")})`;
  if ("clamp" in s) return `clamp(${s.clamp.map(sizeCss).join(", ")})`;
  const terms: string[] = [];
  for (const u of SIZE_UNITS) {
    const k = round(s[u] ?? 0);
    if (k === 0) continue;
    const size = Math.abs(k);
    const name = VAR[u];
    const term =
      name === undefined ? `${size}${u}` : `${size === 1 ? "" : `${size} * `}var(${name})`;
    terms.push(
      terms.length === 0 ? (k < 0 ? `0px - ${term}` : term) : ` ${k < 0 ? "-" : "+"} ${term}`,
    );
  }
  if (terms.length === 0) return "0px";
  const lone = SIZE_UNITS.find((u) => (s[u] ?? 0) !== 0)!;
  const bare = terms.length === 1 && VAR[lone] === undefined && (s[lone] ?? 0) > 0;
  return bare ? terms[0]! : `calc(${terms.join("")})`;
};

/** Everything after `g` may be written in terms of the four before it. */
export interface OpenerLayout {
  m: Size;
  bx: Size;
  by: Size;
  g: Size;
  h: Size;
  aboveX: Size;
  aboveY: Size;
  belowX: Size;
  belowY: Size;
  navTop: Size;
  navW: Size;
  navH: Size;
  title: Size;
  lead: Size;
}

export const OPENER_PROPS: Record<keyof OpenerLayout, string> = {
  m: "--m",
  bx: "--bx",
  by: "--by",
  g: "--g",
  h: "--h",
  aboveX: "--above-x",
  aboveY: "--above-y",
  belowX: "--below-x",
  belowY: "--below-y",
  navTop: "--nav-top",
  navW: "--nav-w",
  navH: "--nav-h",
  title: "--title",
  lead: "--lead",
};

const NAV_TOP: Size = { clamp: [{ rem: 1 }, { cqw: 2.4 }, { rem: 2 }] };
/** Wide enough for four links with their icons, and no wider. */
const NAV_W: Size = { min: [{ cqw: 80 }, { rem: 25 }] };
const NAV_H: Size = { rem: 4 };
const ABOVE_Y: Size = {
  max: [{ clamp: [{ rem: 4.5 }, { cqw: 8.9 }, { rem: 7.5 }] }, { sum: [NAV_TOP, NAV_H] }],
};
/**
 * Capped where the longest Polish word in the title still fits the column beside the S. The floor
 * is bounded by the opener's width too, so a display line stays inside its column on a phone with a
 * 32 px root font size; the lead, the navigation and the buttons still scale in rem.
 */
const titleTimes = (k: number): Size => ({
  clamp: [{ min: [{ rem: 2 * k }, { cqw: 8 * k }] }, { cqw: 4.4 * k }, { rem: 3.6 * k }],
});
const TITLE: Size = titleTimes(1);
export const TITLE_LINE_HEIGHT = 1.02;
/** How many lines a title takes on the narrowest phone (320 px, 32 px type): about 14 characters each. */
export const titleLines = (title: string): number => Math.max(1, Math.ceil(title.length / 14));
/**
 * On a narrow opener the upper arm leaves through the right edge under the navigation: the S sits
 * low enough that the arm's upper edge there clears the navigation's box, or a one-line title would
 * put the band across the links.
 */
const ARM_CLEAR_BY: Size = ((): Size => {
  const p = edges.upperTop;
  return {
    sum: [NAV_TOP, NAV_H, { g: 1 }, { cqw: 100 * tan, bx: -tan, m: -(p[0].m * tan + p[1].m) }],
  };
})();
/**
 * The lockup's top sits level with the title on a wide opener, and under the title's band
 * (`--title-band` = its lines × line height × size) on a narrow one.
 */
const BY_SIZE: Size = {
  wide: { sum: [ABOVE_Y, { m: lockupTop }] },
  narrow: { max: [{ sum: [ABOVE_Y, { tb: 1, g: 1, m: lockupTop }] }, ARM_CLEAR_BY] },
};
const LEAD: Size = { clamp: [{ rem: 1.05 }, { cqw: 1.67 }, { rem: 1.35 }] };

/**
 * The page container's left edge, so the title starts where the body copy does, capped at 24rem
 * (`--bx` caps with it): past that the container keeps centring on 72rem while the S does not, and
 * following it squeezes the title's column against the diagonal until a word breaks mid-word
 * (`Projekt/y` at 2560 on a page).
 */
const CONTAINER_LEFT: Size = {
  min: [
    { max: [{ clamp: [{ rem: 1 }, { cqw: 4 }, { rem: 2.5 }] }, { cqw: 50, rem: -36 }] },
    { rem: 24 },
  ],
};
const BELOW_X: Size = { max: [CONTAINER_LEFT, { bx: 1, m: -0.77 }] };
/**
 * A third of the way down the S, not under it: the word's bottom edge runs up from the S's
 * bottom-right corner, so lines beside the S step along it, and starting this high keeps the upper
 * lines short enough for the steps to show at laptop widths. No clearance here: the shape's margin
 * keeps the lines --g off the foil.
 */
const BELOW_Y: Size = { by: 1, m: body.h * 0.3 };
/**
 * The height at which the lower arm's lower edge still leaves through the left edge, plus `slack`
 * rem: that exit makes the ribbon read as crossing the page, so it sets the floor.
 */
const leftExitFloor = (slack: number): Size => {
  const y = lineY(edges.lowerBottom, ZERO_F);
  return { by: y.by, bx: y.bx, m: y.m, rem: slack };
};

/**
 * Variants whose ribbon is a dimmed band the copy stands on rather than a shape it wraps, with the
 * lockup small in the navigation.
 */
export const backdropVariants: ReadonlySet<string> = new Set(["page"]);

export const openerLayouts: Record<"home" | "page" | "sheet", OpenerLayout> = {
  home: {
    m: { clamp: [{ rem: 7.8 }, { cqw: 23.6 }, { rem: 22 }] },
    bx: { clamp: [{ rem: 3 }, { cqw: 44.5, px: -125 }, { rem: 60 }] },
    by: BY_SIZE,
    g: { clamp: [{ px: 12 }, { cqw: 1.39 }, { px: 20 }] },
    /**
     * No window-height floor: past the left exit, height only adds empty canvas under the diagonal
     * and pushes the next section off the first screen.
     */
    h: {
      wide: { max: [{ rem: 48 }, leftExitFloor(2)] },
      narrow: leftExitFloor(2),
    },
    aboveX: CONTAINER_LEFT,
    aboveY: ABOVE_Y,
    belowX: BELOW_X,
    belowY: BELOW_Y,
    navTop: NAV_TOP,
    navW: NAV_W,
    navH: NAV_H,
    title: TITLE,
    lead: LEAD,
  },
  /**
   * The band follows the line the upper arm would take with the S right of the title's column and
   * under the navigation. `h` is 0 because the header is as tall as its copy: the band runs on under
   * the page's content and leaves through the page's left edge further down.
   */
  page: {
    m: { clamp: [{ rem: 5.5 }, { cqw: 12.5 }, { rem: 11 }] },
    bx: { sum: [CONTAINER_LEFT, { clamp: [{ rem: 11 }, { cqw: 25 }, { rem: 16 }] }] },
    by: { sum: [NAV_TOP, { rem: 2.4, g: 1, m: lockupTop }] },
    g: { clamp: [{ px: 12 }, { cqw: 1.11 }, { px: 16 }] },
    h: { px: 0 },
    aboveX: CONTAINER_LEFT,
    aboveY: ABOVE_Y,
    belowX: CONTAINER_LEFT,
    belowY: { px: 0 },
    navTop: NAV_TOP,
    navW: NAV_W,
    navH: NAV_H,
    title: TITLE,
    lead: LEAD,
  },
  sheet: {
    m: { px: 200 },
    bx: { px: 420 },
    // The word's top is level with the title's.
    by: { px: 96, m: lockupTop },
    g: { px: 16 },
    h: { max: [{ px: 480 }, leftExitFloor(1.5)] },
    aboveX: { px: 96 },
    aboveY: { px: 96 },
    belowX: { max: [{ px: 96 }, { bx: 1, m: -0.77 }] },
    belowY: BELOW_Y,
    navTop: { px: 0 },
    navW: { px: 0 },
    navH: { px: 0 },
    // The column beside the S is 378 px wide on the sheet, and the title may not be hyphenated
    // there: 44 px is the step at which two words of either language's title still share a line.
    title: { px: 44 },
    lead: { px: 33 },
  },
};

/** The root font size (--step-0 in tokens.css) at a viewport width, both in px. */
export const rootFontSize = (w: number): number =>
  Math.min(18, Math.max(16, 0.95 * 16 + 0.0025 * w));

/** Every size resolved to px at a given viewport. */
export const openerSizes = (
  layout: OpenerLayout,
  viewport: { w: number; h: number; rem?: number; titleLines?: number },
): Record<keyof OpenerLayout, number> & OpenerVars => {
  const rem = viewport.rem ?? rootFontSize(viewport.w);
  const c: SizeContext = {
    px: 1,
    narrow: viewport.w < NARROW_REM * rem,
    rem,
    cqw: viewport.w / 100,
    svh: viewport.h / 100,
    m: 0,
    bx: 0,
    by: 0,
    g: 0,
    tb: 0,
  };
  c.tb = (viewport.titleLines ?? 3) * TITLE_LINE_HEIGHT * sizeValue(layout.title, c);
  // g before by: the narrow by reads g, and a size read before it is resolved counts as zero.
  for (const key of ["m", "bx", "g", "by"] as const) c[key] = sizeValue(layout[key], c);
  const out = Object.fromEntries(
    (Object.keys(OPENER_PROPS) as (keyof OpenerLayout)[]).map((k) => [k, sizeValue(layout[k], c)]),
  ) as Record<keyof OpenerLayout, number>;
  return { ...out, w: viewport.w, zx: 0, zy: 0 };
};

/** A wide/narrow size becomes `--x-wide` and `--x-narrow`; the component picks one by container query. */
export const openerStyle = (layout: OpenerLayout): string =>
  (Object.keys(OPENER_PROPS) as (keyof OpenerLayout)[])
    .map((k) => {
      const s = layout[k];
      return "wide" in s
        ? `${OPENER_PROPS[k]}-wide:${sizeCss(s.wide)};${OPENER_PROPS[k]}-narrow:${sizeCss(s.narrow)}`
        : `${OPENER_PROPS[k]}:${sizeCss(s)}`;
    })
    .join(";");
