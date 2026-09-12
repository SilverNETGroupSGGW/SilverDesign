import geometry from "../../brand/logo/geometry.json";
import lockup from "../../brand/logo/lockup.json";

/**
 * The opener's sizes, in px. Every point of the construction is linear in these, so one polygon
 * string written in `calc()` of the matching custom properties serves every breakpoint, and a test
 * can evaluate the same points as numbers.
 */
export interface OpenerVars {
  /** The mark box's size (the exported viewBox is square). */
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
const { direction, axis, start, width } = geometry.ribbon;
const dir = [direction[0]!, direction[1]!] as const;
const across = [-dir[1], dir[0]] as const;
const centre = [vbX + vbSize / 2, vbY + vbSize / 2] as const;
const twin = [2 * centre[0] - axis[0]!, 2 * centre[1] - axis[1]!] as const;

/** The one inclination of the whole system, as a slope in screen coordinates. */
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

/** Where the line through `p` at the system's inclination is, given one coordinate. */
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
const project = (p: [number, number], onto: readonly [number, number]): number =>
  (p[0] - axis[0]!) * onto[0] + (p[1] - axis[1]!) * onto[1];
/** How far the word's box reaches along the arm, and how far below the arm's centreline it hangs. */
const wordEndT = Math.max(...wordCorners.map((c) => project(c, dir)));
const wordOff = Math.max(...wordCorners.map((c) => project(c, across)));

/**
 * The four arm edges and the word's bottom rule, each as a point the line runs through: the upper
 * arm is the one that leaves towards the top right, the lower arm its turned twin.
 */
export const edges = {
  upperTop: at(along(axis as [number, number], 0, -width / 2)),
  upperBottom: at(along(axis as [number, number], 0, width / 2)),
  lowerTop: at(along(twin, 0, -width / 2)),
  lowerBottom: at(along(twin, 0, width / 2)),
  wordBottom: at(along(axis as [number, number], 0, wordOff)),
};

const ZERO_F = form({});
const W = form({ w: 1 });
const H = form({ h: 1 });
const G = form({ g: 1 });
const BX = form({ bx: 1 });
const BY = form({ by: 1 });
const bodyRight = add(BX, form({ m: body.w }), G);
const bodyBottom = add(BY, form({ m: body.h }), G);
const wordStart = at(along(axis as [number, number], start, wordOff));
const wordEnd = at(along(axis as [number, number], wordEndT, wordOff));

/** Where an arm edge leaves through the top. Past the right edge it is clipped, not wrong. */
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
  [BX, lineY(edges.lowerBottom, BX)],
  [BX, bodyBottom],
  [add(BX, form({ m: body.w })), bodyBottom],
  [wordStart[0], lineY(edges.wordBottom, wordStart[0])],
  [wordEnd[0], lineY(edges.wordBottom, wordEnd[0])],
  [add(wordEnd[0], G), lineY(edges.upperBottom, add(wordEnd[0], G))],
  topExit(edges.upperBottom),
];

/** The float above the ribbon holds everything below the boundary; the one below it, everything above. */
export const shapeAbove: Point[] = [...aboveBoundary, [W, ZERO_F], [W, H], [ZERO_F, H]];
export const shapeBelow: Point[] = [
  [ZERO_F, ZERO_F],
  [belowBoundary.at(-1)![0], ZERO_F],
  ...belowBoundary.slice(0, -1).toReversed(),
];

/** The mark's svg sits on its own box, which the S body's corner places. */
export const markOrigin = at([vbX, vbY]);

/** The link to the home page covers the S and the word, and nothing else. */
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
    leftTop: at0(edges.lowerTop),
    leftBottom: at0(edges.lowerBottom),
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

/* The sizes the construction is driven by, written once so the component's custom properties and
   the invariant test read the same numbers. */

const SIZE_UNITS = ["px", "rem", "cqw", "svh", "m", "bx", "by", "g"] as const;
type SizeUnit = (typeof SIZE_UNITS)[number];
type Terms = Partial<Record<SizeUnit, number>>;
export type Size =
  | Terms
  | { sum: Size[] }
  | { min: Size[] }
  | { max: Size[] }
  | { clamp: [Size, Size, Size] };

/** What a length resolves against: the opener's box, the root font size, and the sizes above. */
export interface SizeContext extends Record<SizeUnit, number> {
  px: 1;
}

const VAR: Partial<Record<SizeUnit, string>> = { m: "--m", bx: "--bx", by: "--by", g: "--g" };

export const sizeValue = (s: Size, c: SizeContext): number => {
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
  const one = terms.length === 1 && VAR[SIZE_UNITS.find((u) => (s[u] ?? 0) !== 0)!] === undefined;
  return one ? terms[0]! : `calc(${terms.join("")})`;
};

/** One opener's sizes. Everything after `g` may be written in terms of the four before it. */
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
/** The box the navigation is allowed: wide enough for four links on a phone, and no wider. */
const NAV_W: Size = { min: [{ cqw: 80 }, { rem: 21 }] };
const NAV_H: Size = { rem: 4 };
/** The title starts below the box the navigation reserves. */
const ABOVE_Y: Size = {
  max: [{ clamp: [{ rem: 4.5 }, { cqw: 8.9 }, { rem: 7.5 }] }, { sum: [NAV_TOP, NAV_H] }],
};
/** Capped where the longest Polish word in the title still fits the column beside the S. */
const TITLE: Size = { clamp: [{ rem: 2 }, { cqw: 4.4 }, { rem: 3.6 }] };
const LEAD: Size = { clamp: [{ rem: 1.05 }, { cqw: 1.67 }, { rem: 1.35 }] };

/** The left edge of the page's own container, so the title starts where the body copy does. */
const CONTAINER_LEFT: Size = {
  min: [
    { max: [{ clamp: [{ rem: 1 }, { cqw: 4 }, { rem: 2.5 }] }, { cqw: 50, rem: -36 }] },
    {
      rem: 24,
    },
  ],
};
/** The S sits clear of the title's column, and the lead starts short of the S. */
const BELOW_X: Size = { max: [CONTAINER_LEFT, { bx: 1, m: -0.77 }] };
/** The lead starts under the S's bottom edge, two clearances down. */
const BELOW_Y: Size = { by: 1, m: body.h, g: 2 };
/**
 * The opener is never shorter than the height at which the lower arm's lower edge still leaves
 * through the left edge: that exit is what makes the ribbon read as crossing the page, so it sets
 * the floor rather than being checked against one.
 */
const leftExitFloor = (slack: number): Size => {
  const y = lineY(edges.lowerBottom, ZERO_F);
  return { by: y.by, bx: y.bx, m: y.m, rem: slack };
};

export const openerLayouts: Record<"home" | "page" | "sheet", OpenerLayout> = {
  home: {
    m: { clamp: [{ rem: 7.8 }, { cqw: 23.6 }, { rem: 22 }] },
    bx: { clamp: [{ rem: 3 }, { cqw: 48.42, px: -135.7 }, { rem: 60 }] },
    by: { max: [{ rem: 11 }, { px: 360.8, cqw: -7.69 }] },
    g: { clamp: [{ px: 12 }, { cqw: 1.39 }, { px: 20 }] },
    h: { max: [{ rem: 48 }, { svh: 100 }, leftExitFloor(2)] },
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
  page: {
    m: { clamp: [{ rem: 6.5 }, { cqw: 20.8 }, { rem: 19 }] },
    bx: { clamp: [{ rem: 3 }, { cqw: 41.5, px: -117 }, { rem: 40 }] },
    by: { max: [{ rem: 8.5 }, { px: 270, cqw: -8.65 }] },
    g: { clamp: [{ px: 12 }, { cqw: 1.11 }, { px: 16 }] },
    h: { max: [{ rem: 26 }, leftExitFloor(2)] },
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
  sheet: {
    m: { px: 240 },
    bx: { px: 500 },
    by: { px: 130 },
    g: { px: 16 },
    h: { px: 585 },
    aboveX: { px: 96 },
    aboveY: { px: 96 },
    belowX: { max: [{ px: 96 }, { bx: 1, m: -0.77 }] },
    belowY: BELOW_Y,
    navTop: { px: 0 },
    navW: { px: 0 },
    navH: { px: 0 },
    // The column beside the S is 372 px wide on the sheet; at 60 px the longest word in the Polish
    // title is wider than that, and a broken word lands under the ribbon.
    title: { px: 52 },
    lead: { px: 26 },
  },
};

/** The root font size the page's own scale resolves to at a given viewport width. */
export const rootFontSize = (w: number): number =>
  Math.min(18, Math.max(16, 0.95 * 16 + 0.0025 * w));

/** Every size of one opener, resolved to px at a given viewport. */
export const openerSizes = (
  layout: OpenerLayout,
  viewport: { w: number; h: number; rem?: number },
): Record<keyof OpenerLayout, number> & OpenerVars => {
  const rem = viewport.rem ?? rootFontSize(viewport.w);
  const c: SizeContext = {
    px: 1,
    rem,
    cqw: viewport.w / 100,
    svh: viewport.h / 100,
    m: 0,
    bx: 0,
    by: 0,
    g: 0,
  };
  for (const key of ["m", "bx", "by", "g"] as const) c[key] = sizeValue(layout[key], c);
  const out = Object.fromEntries(
    (Object.keys(OPENER_PROPS) as (keyof OpenerLayout)[]).map((k) => [k, sizeValue(layout[k], c)]),
  ) as Record<keyof OpenerLayout, number>;
  return { ...out, w: viewport.w, zx: 0, zy: 0 };
};

export const openerStyle = (layout: OpenerLayout): string =>
  (Object.keys(OPENER_PROPS) as (keyof OpenerLayout)[])
    .map((k) => `${OPENER_PROPS[k]}:${sizeCss(layout[k])}`)
    .join(";");
