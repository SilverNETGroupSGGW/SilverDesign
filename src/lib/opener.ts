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

const SIZE_UNITS = [
  "px",
  "rem",
  "cqw",
  "svh",
  "m",
  "bx",
  "by",
  "g",
  "tb",
  "nh",
  "ld",
  "dr",
  "cw",
  "tt",
  "tr",
  "tl",
] as const;
type SizeUnit = (typeof SIZE_UNITS)[number];
type Terms = Partial<Record<SizeUnit, number>>;
export type Size =
  | Terms
  | { sum: Size[] }
  | { min: Size[] }
  | { max: Size[] }
  | { clamp: [Size, Size, Size] }
  | { times: [number, Size] }
  /** Two values, one per side of the opener's narrow breakpoint (a container query, not a calc). */
  | { wide: Size; narrow: Size }
  /** Two values, one per side of STACK_REM, picked the same way. */
  | { row: Size; stacked: Size };

/**
 * Below this container width the title takes the whole width and the lockup sits under it. As low
 * as 56rem (~990px) because a 1024 laptop still fits a three-line title beside the S, and the copy
 * wrapping along the ribbon is the composition: it should show on every screen that can hold it.
 * A window taller than it is wide takes the narrow composition at any width (Opener.astro): beside
 * the S the title has a short column and the band leaves through the left edge halfway down, so a
 * portrait tablet stacked the title, the band and a far-off lead in three bands with holes between.
 */
export const NARROW_REM = 56;

/**
 * Below this container width the home page's links stack, one a row: the folded row's floor
 * (Opener.astro), which only large text reaches on a phone.
 */
export const STACK_REM = 18.25;

export interface SizeContext extends Record<SizeUnit, number> {
  px: 1;
  narrow: boolean;
  stacked: boolean;
}

const VAR: Partial<Record<SizeUnit, string>> = {
  m: "--m",
  bx: "--bx",
  by: "--by",
  g: "--g",
  tb: "--title-band",
  nh: "--nav-h",
  ld: "--lead",
  dr: "--drop",
  cw: "--cta-wrap",
  tt: "--title",
  tr: "--title-reach",
  tl: "--title-reach-last",
};

export const sizeValue = (s: Size, c: SizeContext): number => {
  if ("wide" in s) return sizeValue(c.narrow ? s.narrow : s.wide, c);
  if ("row" in s) return sizeValue(c.stacked ? s.stacked : s.row, c);
  if ("times" in s) return s.times[0] * sizeValue(s.times[1], c);
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
  if ("wide" in s || "row" in s)
    throw new Error("a two-sided size is written as two properties, not one calc()");
  if ("times" in s) return `calc(${round(s.times[0])} * ${sizeCss(s.times[1])})`;
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
  /** How far the composition stands below its place, on a window taller than it (home only). */
  drop: Size;
  /** The lead's clearance from the foil: the shape's margin under the ribbon. */
  clear: Size;
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
  drop: "--drop",
  clear: "--clear",
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
/** Four links of 2.4rem (0.45rem of padding over and under a 1.5 line), with no gap between. */
const NAV_H_STACKED: Size = { rem: 9.6 };
const ABOVE_Y: Size = {
  max: [{ clamp: [{ rem: 4.5 }, { cqw: 8.9 }, { rem: 7.5 }] }, { sum: [NAV_TOP, { nh: 1 }] }],
};
/**
 * "informatyków", the widest word in either title, is 6.28em in the title's face; the rest is room
 * for another engine's metrics. Not left to the hyphen: Chromium has no hyphenation dictionary on
 * some platforms and breaks the word anywhere instead.
 */
export const TITLE_WIDEST_WORD = 6.4;
/**
 * Capped where the longest Polish word in the title still fits the column beside the S. The floor
 * is 8cqw at the default text size, where it is the smaller: 2rem less 6.4px reaches 8cqw only at
 * 320 px on a 16 px root. A larger text size raises it with the root, as far as the widest word
 * still fits the full-width column (100cqw less the 1rem insets) on a phone.
 */
const TITLE_FULL_WIDTH: Size = { cqw: 100 / TITLE_WIDEST_WORD, rem: -2 / TITLE_WIDEST_WORD };
const titleFloor = (k: number): Size => ({
  min: [{ rem: 2 * k }, { max: [{ cqw: 8 * k }, { rem: 2 * k, px: -6.4 * k }] }, TITLE_FULL_WIDTH],
});
const titleTimes = (k: number): Size => ({
  clamp: [titleFloor(k), { cqw: 4.4 * k }, { rem: 3.6 * k }],
});
const TITLE: Size = titleTimes(1);
export const TITLE_LINE_HEIGHT = 1.02;
/** How many lines a title takes on the narrowest phone (320 px, 32 px type): about 14 characters each. */
export const titleLines = (title: string): number => Math.max(1, Math.ceil(title.length / 14));
/** What one character of the title is wide on average, with room for another engine's metrics. */
const TITLE_CHAR_EM = 0.55;
/**
 * How far right the title reaches, in ems, when it takes `lines` lines: its longest line, and its
 * last, once its words are wrapped as evenly as they go. The narrow lockup sits as close under the
 * title as the upper arm allows there, and not under the window's right edge, which a title rarely
 * reaches: the arm rises to the right, so the last line, which is short, is the nearest only as far
 * as it runs, and further right the lines above it are.
 */
export const titleReach = (title: string, lines: number): { full: number; last: number } => {
  const words = title.split(/\s+/);
  const wrap = (limit: number): number[] => {
    const out = [-1];
    for (const word of words) {
      const next = out.at(-1)! + word.length + 1;
      if (next > limit && out.at(-1)! >= 0) out.push(word.length);
      else out[out.length - 1] = next;
    }
    return out;
  };
  let limit = Math.max(...words.map((word) => word.length));
  while (wrap(limit).length > lines) limit += 1;
  const lengths = wrap(limit);
  return { full: Math.max(...lengths) * TITLE_CHAR_EM, last: lengths.at(-1)! * TITLE_CHAR_EM };
};
/**
 * The same with the links stacked, where the title's floor follows the root: its column is down to
 * TITLE_WIDEST_WORD em, about 11 characters.
 */
export const titleLinesStacked = (title: string): number =>
  Math.max(1, Math.ceil(title.length / 11));
/**
 * The same on a narrow window held landscape (a phone on its side), where the title's size follows
 * the height (HOME_TITLE): about 40 characters a line. Counting a phone's three lines there put the
 * S a whole screen down.
 */
export const titleLinesLandscape = (title: string): number =>
  Math.max(1, Math.ceil(title.length / 40));
/**
 * The same on a portrait window at least 50rem wide (a monitor on its side, a split screen), where
 * the title has stopped growing with the width: about 20 characters a line.
 */
export const titleLinesBroad = (title: string): number => Math.max(1, Math.ceil(title.length / 20));
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
/**
 * On a narrow opener the upper arm leaves through the right edge under the navigation: the S sits
 * low enough that the arm's upper edge there clears the box above it by --g, or a one-line title
 * would put the band across the links. On the home page the title's band is that box too: a mark
 * as wide as the screen raises the arm into the title's last line and breaks its last word.
 */
const armClearBy = (above: Size, clear: Size = { g: 1 }, x: Size = { cqw: 100 }): Size => {
  const p = edges.upperTop;
  return {
    sum: [above, clear, { times: [tan, x] }, { bx: -tan, m: -(p[0].m * tan + p[1].m) }],
  };
};
const ARM_CLEAR_BY: Size = armClearBy({ sum: [NAV_TOP, { nh: 1 }] });
/**
 * Narrow, the space between the title and the foil under it, and between the foil and the lead
 * under that: the same both ways, so neither block reads as closer to the band, and in proportion
 * to the title it answers.
 */
const NARROW_CLEAR: Size = { max: [{ g: 1 }, { tt: 0.6 }] };
/**
 * The lockup's top sits level with the title on a wide opener, and under the title's band
 * (`--title-band` = its lines × line height × size) on a narrow one. The home page's composition
 * stands lower by --drop.
 */
const BY_BASE: { wide: Size; narrow: Size } = {
  wide: { sum: [ABOVE_Y, { m: lockupTop }] },
  narrow: {
    max: [
      { sum: [ABOVE_Y, { tb: 1, m: lockupTop }, NARROW_CLEAR] },
      ARM_CLEAR_BY,
      armClearBy({ sum: [ABOVE_Y, { tb: 1 }] }, NARROW_CLEAR, {
        sum: [CONTAINER_LEFT, { tl: 1 }],
      }),
      armClearBy({ sum: [ABOVE_Y, { tb: 1, tt: -TITLE_LINE_HEIGHT }] }, NARROW_CLEAR, {
        sum: [CONTAINER_LEFT, { tr: 1 }],
      }),
    ],
  },
};
const LEAD: Size = { clamp: [{ rem: 1.05 }, { cqw: 1.67 }, { rem: 1.35 }] };

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
const leftExit = lineY(edges.lowerBottom, ZERO_F);
const leftExitFloor = (slack: number): Size => ({
  by: leftExit.by,
  bx: leftExit.bx,
  m: leftExit.m,
  rem: slack,
});

/**
 * The home opener is at least one screen tall, so the next section never shows above the fold, and
 * the lower arm leaves through its left edge this many rem above the window's bottom.
 */
const HOME_EXIT_SLACK = 1.25;
/**
 * The size a wide title grows to with the screen. The height caps it on an ultrawide, where moving
 * the S that far right for it left the band too short a run to the left exit and the mark small.
 */
const HOME_TITLE_TARGET: Size = { min: [{ cqw: 4.4 }, { svh: 9 }] };
/**
 * Wide, past a laptop the S stands right of where the band alone would put it, far enough for the
 * title to reach its target beside it with its widest word whole (HOME_TITLE): on a desktop it
 * stopped at 3.6rem and left the screen's upper half to the band. The mark gives up what this
 * costs (FIT_HEIGHT).
 */
const HOME_BX: Size = {
  wide: {
    clamp: [
      { rem: 3 },
      {
        max: [
          { cqw: 44.5, px: -125 },
          {
            sum: [CONTAINER_LEFT, { g: 2 }, { times: [TITLE_WIDEST_WORD, HOME_TITLE_TARGET] }],
          },
        ],
      },
      { rem: 66 },
    ],
  },
  /**
   * Narrow and upright, the S keeps the 3rem a phone always gave it, so the lower arm still shows
   * coming in from the left edge, and the mark takes the width from there (HOME_M). On its side,
   * the S moves right with the window's excess width: from the left edge the upper arm would climb
   * the whole width and only leave through the right edge a screen further down.
   */
  narrow: { clamp: [{ rem: 3 }, { cqw: 50, svh: -50 }, { rem: 60 }] },
};
/** The word's far end stays this far in from the right edge, as a fraction of the width. */
const WORD_END_MAX = 0.93;
const FIT_WIDTH: Size = {
  cqw: (100 * WORD_END_MAX) / wordEnd[0].m,
  bx: -wordEnd[0].bx / wordEnd[0].m,
};
/**
 * On a wide opener the lockup's top is level with the title, so a larger mark moves the lower arm's
 * exit down: this is the largest mark whose arm still leaves through the left edge on the first
 * screen. On a desktop the arm already runs nearly corner to corner, and the width alone would push
 * it out through the bottom.
 */
const FIT_HEIGHT: Size = {
  times: [
    1 / (lockupTop + leftExit.m),
    { sum: [{ svh: 100, bx: -leftExit.bx, rem: -HOME_EXIT_SLACK }, { times: [-1, ABOVE_Y] }] },
  ],
};
/**
 * Wide, capped where the widest word fits the column beside the S, which ends two --g short of it:
 * the boundary stands one off the S and the shape's margin keeps the lines another off the
 * boundary. Never below the 3.6rem the title has always had: at that size the lines holding it sit
 * above the S. Narrow, the title has the whole width, and on a phone held upright the spare height
 * too.
 */
const HOME_TITLE: Size = {
  wide: {
    clamp: [
      titleFloor(1),
      HOME_TITLE_TARGET,
      {
        max: [
          { rem: 3.6 },
          {
            times: [
              1 / TITLE_WIDEST_WORD,
              { sum: [{ bx: 1, g: -2 }, { times: [-1, CONTAINER_LEFT] }] },
            ],
          },
        ],
      },
    ],
  },
  narrow: {
    clamp: [
      titleFloor(1),
      { min: [{ cqw: 15 }, { svh: 7 }] },
      { min: [{ rem: 5.5 }, TITLE_FULL_WIDTH] },
    ],
  },
};
/** Narrow, the lead grows a step on a tall screen, where there is the height for it. */
const HOME_LEAD: Size = {
  wide: { clamp: [{ rem: 1.05 }, { min: [{ cqw: 1.67 }, { svh: 3 }] }, { rem: 2.4 }] },
  narrow: { clamp: [{ rem: 1.05 }, { min: [{ cqw: 5.2 }, { svh: 2.4 }] }, { rem: 1.4 }] },
};
/** The scroll cue's type size, which its drawing is measured in: it grows with the lead. */
export const CUE_SIZE: Size = { max: [{ rem: 0.875 }, { ld: 0.55 }] };
/**
 * The scroll cue under the buttons (Home.astro): a gap of half its size, its rule 3.74em tall, and
 * the 1.5rem the opener keeps under it.
 */
export const CUE_ROOM: Size = { sum: [{ rem: 1.5 }, { times: [4.25, CUE_SIZE] }] };
/**
 * Under the lead's first line: the rest of it and the buttons, in lead sizes on a wide opener (the
 * buttons scale with it, Home.astro), and four lines and a row of buttons on a narrow one, two rows
 * where they wrap (--cta-wrap, Opener.astro).
 */
const LEAD_BLOCK: { wide: Size; narrow: Size } = {
  wide: { ld: 7.6 },
  narrow: { ld: 5.4, rem: 4.9, cw: 1 },
};
/**
 * Narrow, where the lead's first line starts below the S's top: the word runs out to the right
 * margin, and a line ranged right clears it only under the word's bottom edge about halfway across.
 */
const WORD_CLEAR_M = ((): number => {
  const [x, y] = edges.wordBottom;
  return y.m + tan * x.m;
})();
const WORD_CLEAR_REST: Size = { sum: [{ bx: tan, cqw: -50 * tan }, NARROW_CLEAR] };
const WORD_CLEAR: Size = { sum: [{ m: WORD_CLEAR_M }, WORD_CLEAR_REST] };
/**
 * The lead sits as low in the triangle under the ribbon as the band's left exit, the composition's
 * natural foot: right under the word it left the lower half of a desktop screen empty, and lower
 * in the triangle the diagonal is further left, so the lines are longer and fewer. Narrow, it
 * starts under the word where a line ranged right first has room (WORD_CLEAR): any higher, the
 * first line was a sliver beside the word's end, and "Aplikacje" broke in two there.
 */
const HOME_BELOW_Y: Size = {
  wide: {
    max: [
      BELOW_Y,
      {
        sum: [
          leftExitFloor(HOME_EXIT_SLACK),
          { times: [-1, LEAD_BLOCK.wide] },
          { times: [-1, CUE_ROOM] },
        ],
      },
    ],
  },
  narrow: { sum: [{ by: 1 }, { max: [{ m: body.h * 0.3 }, WORD_CLEAR] }] },
};
/**
 * How far the whole composition (the title, the lockup, the lead, the buttons and the cue) stands
 * below where it starts, as composed: half the window's height it does not use, so a window taller
 * than the composition centres it rather than opening a hole inside it, while the navigation stays
 * at the top. Zero on a landscape desktop, where the mark grows until the band spans the height
 * (FIT_HEIGHT).
 */
const homeDrop = (byBase: Size, leadTop: Size, block: Size): Size => {
  const exit: Size = { m: leftExit.m, bx: leftExit.bx, rem: HOME_EXIT_SLACK };
  const foot: Size = { sum: [leadTop, block, CUE_ROOM] };
  return {
    max: [
      { px: 0 },
      {
        times: [
          0.5,
          { sum: [{ svh: 100 }, { times: [-1, byBase] }, { times: [-1, { max: [exit, foot] }] }] },
        ],
      },
    ],
  };
};
/**
 * Narrow, the largest mark whose composition still fits the window: the lockup's top under the
 * title (or as low as the arm's clearance puts it) and the foot (the left exit, or the lead's block
 * and the cue) each grow with the mark, and every pairing has to end inside the window. Except the
 * arm's clearance over the lead's block: there the mark barely moves the foot, and shrinking it to
 * fit left a sliver of a lockup on a portrait monitor. That composition outgrows the window instead.
 */
const FIT_HEIGHT_NARROW: Size = ((): Size => {
  const title: Size = { sum: [ABOVE_Y, { tb: 1 }, NARROW_CLEAR] };
  const p = edges.upperTop;
  const arm = (lines: Terms, reach: Terms): [Size, number] => [
    { sum: [title, lines, { times: [tan, { sum: [CONTAINER_LEFT, reach] }] }, { bx: -tan }] },
    -(p[0].m * tan + p[1].m),
  ];
  const tops: [Size, number][] = [
    [title, lockupTop],
    arm({}, { tl: 1 }),
    arm({ tt: -TITLE_LINE_HEIGHT }, { tr: 1 }),
  ];
  const feet: [Size, number][] = [
    [{ bx: leftExit.bx, rem: HOME_EXIT_SLACK }, leftExit.m],
    [{ sum: [LEAD_BLOCK.narrow, CUE_ROOM] }, body.h * 0.3],
    [{ sum: [LEAD_BLOCK.narrow, CUE_ROOM, WORD_CLEAR_REST] }, WORD_CLEAR_M],
  ];
  return {
    min: tops.flatMap(([top, a], i) =>
      feet
        .filter((_, j) => i === 0 || j === 0)
        .map(([foot, b]): Size => ({
          times: [
            1 / (a + b),
            { sum: [{ svh: 100 }, { times: [-1, top] }, { times: [-1, foot] }] },
          ],
        })),
    ),
  };
})();
/**
 * The mark grows with the screen as far as the word's end and the left exit allow, which a cap in
 * rem cannot see: 22rem left a 2560 screen half empty and still crowded a short laptop. Narrow, it
 * runs the word out to the right margin on a phone, and fills the height of a portrait tablet.
 */
const HOME_M: Size = {
  wide: { clamp: [{ rem: 7.8 }, { min: [{ cqw: 28 }, FIT_WIDTH, FIT_HEIGHT] }, { rem: 40 }] },
  narrow: { clamp: [{ rem: 7.8 }, { min: [FIT_WIDTH, FIT_HEIGHT_NARROW] }, { rem: 40 }] },
};
const HOME_DROP: Size = {
  wide: homeDrop(BY_BASE.wide, { m: body.h * 0.3 }, LEAD_BLOCK.wide),
  narrow: homeDrop(BY_BASE.narrow, { max: [{ m: body.h * 0.3 }, WORD_CLEAR] }, LEAD_BLOCK.narrow),
};

/**
 * Variants whose ribbon is a dimmed band the copy stands on rather than a shape it wraps, with the
 * lockup small in the navigation.
 */
export const backdropVariants: ReadonlySet<string> = new Set(["page"]);

export const openerLayouts: Record<"home" | "page" | "sheet", OpenerLayout> = {
  home: {
    m: HOME_M,
    bx: HOME_BX,
    by: { wide: { sum: [BY_BASE.wide, { dr: 1 }] }, narrow: { sum: [BY_BASE.narrow, { dr: 1 }] } },
    drop: HOME_DROP,
    // NARROW_CLEAR measured along the vertical, as the title's is: the margin is taken square to the
    // diagonal. Less a quarter of the lead's line, which on average its lines land below the margin,
    // stepping down the diagonal a whole line at a time.
    clear: {
      wide: { g: 1 },
      narrow: {
        max: [
          { g: 1 },
          { sum: [{ times: [Math.cos(Math.atan(tan)), NARROW_CLEAR] }, { ld: -0.34 }] },
        ],
      },
    },
    g: { clamp: [{ px: 12 }, { cqw: 1.39 }, { px: 20 }] },
    /** svh, not vh: a phone's toolbar must not let the next section show under a full opener. */
    h: { max: [{ svh: 100 }, leftExitFloor(HOME_EXIT_SLACK)] },
    aboveX: CONTAINER_LEFT,
    aboveY: { sum: [ABOVE_Y, { dr: 1 }] },
    belowX: BELOW_X,
    belowY: HOME_BELOW_Y,
    navTop: NAV_TOP,
    navW: NAV_W,
    navH: { row: NAV_H, stacked: NAV_H_STACKED },
    title: HOME_TITLE,
    lead: HOME_LEAD,
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
    drop: { px: 0 },
    clear: { g: 1 },
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
    drop: { px: 0 },
    clear: { g: 1 },
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
  viewport: {
    w: number;
    h: number;
    rem?: number;
    titleLines?: number;
    /** The title's longest and last lines, in ems (titleReach). */
    titleReach?: { full: number; last: number };
  },
): Record<keyof OpenerLayout, number> & OpenerVars => {
  const rem = viewport.rem ?? rootFontSize(viewport.w);
  const c: SizeContext = {
    px: 1,
    narrow: viewport.w < NARROW_REM * rem || viewport.w < viewport.h,
    stacked: viewport.w < STACK_REM * rem,
    rem,
    cqw: viewport.w / 100,
    svh: viewport.h / 100,
    m: 0,
    bx: 0,
    by: 0,
    g: 0,
    tb: 0,
    nh: 0,
    ld: 0,
    dr: 0,
    cw: 0,
    tt: 0,
    tr: 0,
    tl: 0,
  };
  c.nh = sizeValue(layout.navH, c);
  // In the order they read each other: a size read before it is resolved counts as zero.
  for (const key of ["g", "bx"] as const) c[key] = sizeValue(layout[key], c);
  c.tt = sizeValue(layout.title, c);
  c.tb = (viewport.titleLines ?? 3) * TITLE_LINE_HEIGHT * c.tt;
  c.tr = (viewport.titleReach?.full ?? 6.6) * c.tt;
  c.tl = (viewport.titleReach?.last ?? 4.4) * c.tt;
  c.ld = sizeValue(layout.lead, c);
  c.m = sizeValue(layout.m, c);
  c.dr = sizeValue(layout.drop, c);
  c.by = sizeValue(layout.by, c);
  const out = Object.fromEntries(
    (Object.keys(OPENER_PROPS) as (keyof OpenerLayout)[]).map((k) => [k, sizeValue(layout[k], c)]),
  ) as Record<keyof OpenerLayout, number>;
  return { ...out, w: viewport.w, zx: 0, zy: 0 };
};

/**
 * A wide/narrow size becomes `--x-wide` and `--x-narrow`, a row/stacked one `--x-row` and
 * `--x-stacked`; the component picks one by container query.
 */
export const openerStyle = (layout: OpenerLayout): string =>
  (Object.keys(OPENER_PROPS) as (keyof OpenerLayout)[])
    .map((k) => {
      const s = layout[k];
      const p = OPENER_PROPS[k];
      if ("wide" in s) return `${p}-wide:${sizeCss(s.wide)};${p}-narrow:${sizeCss(s.narrow)}`;
      if ("row" in s) return `${p}-row:${sizeCss(s.row)};${p}-stacked:${sizeCss(s.stacked)}`;
      return `${p}:${sizeCss(s)}`;
    })
    .join(";");
