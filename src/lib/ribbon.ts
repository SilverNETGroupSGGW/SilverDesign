export interface RibbonGeometry {
  direction: number[];
  axis: number[];
  start: number;
  width: number;
}

const f = (n: number): string => String(Math.round(n * 10) / 10);

const subpath = (points: number[][]): string =>
  `M ${points.map((p) => `${p[0]} ${p[1]}`).join(" L ")} Z`;

/** Far enough to leave any viewport the mark can be scaled into; whatever holds the mark clips it. */
const REACH = 20000;

/**
 * For the pages that carry the ribbon without the S: with no jog to turn about, the upper arm's line
 * runs through both ways.
 */
export const ribbonBand = (ribbon: RibbonGeometry): string => {
  const { direction, axis, width } = ribbon;
  const across = [-direction[1]! * (width / 2), direction[0]! * (width / 2)];
  const at = (s: number, side: number): number[] => [
    axis[0]! + direction[0]! * s + across[0]! * side,
    axis[1]! + direction[1]! * s + across[1]! * side,
  ];
  return subpath([at(-REACH, -1), at(REACH, -1), at(REACH, 1), at(-REACH, 1)]);
};

/**
 * In mark units: how far a piece of the S runs on past the line where an arm's band starts. The two
 * overlap on the same straight, full-width band instead of meeting edge to edge, where antialiasing
 * leaves a hairline. Shorter than the top bar's straight run, so the overlap never reaches the bend.
 */
export const JOIN_OVERLAP = 24;

/**
 * Where the lower arm reaches full width, in mark units, or `past` units further out: the bent band
 * of the top bar starts on that line.
 */
export const ribbonLowerStart = (ribbon: RibbonGeometry, centre: number[], past = 0): number[] => {
  const { direction, axis, start } = ribbon;
  const twin = [2 * centre[0]! - axis[0]!, 2 * centre[1]! - axis[1]!];
  return [twin[0]! - direction[0]! * (start + past), twin[1]! - direction[1]! * (start + past)];
};

/**
 * As polygon points: everything on the S's side of the line across the lower arm, JOIN_OVERLAP past
 * its full-width point. A cut across the band, not a horizontal one, leaves the mark's arm square
 * on top of the bent band's straight run, with no undrawn wedge between them.
 */
export const ribbonTopBarKeep = (ribbon: RibbonGeometry, centre: number[]): string => {
  const { direction } = ribbon;
  const p0 = ribbonLowerStart(ribbon, centre, JOIN_OVERLAP);
  const across = [-direction[1]!, direction[0]!];
  const far = REACH;
  const a = [p0[0]! + across[0]! * far, p0[1]! + across[1]! * far];
  const b = [p0[0]! - across[0]! * far, p0[1]! - across[1]! * far];
  // `direction` points up-right, towards the S.
  const c = [b[0]! + direction[0]! * far, b[1]! + direction[1]! * far];
  const d = [a[0]! + direction[0]! * far, a[1]! + direction[1]! * far];
  return [a, b, c, d].map((p) => `${f(p[0]!)},${f(p[1]!)}`).join(" ");
};

/**
 * The S cut square across both arms, JOIN_OVERLAP past where each reaches full width: as polygon
 * `points`, and as the band's four corners on those two lines (`ends`). Every ribbon the S stands on
 * starts both arms at the full-width points, so the S alone lands on either kind overlapping the
 * square ends they are left with.
 */
export const ribbonSlab = (
  ribbon: RibbonGeometry,
  centre: number[],
): { points: string; ends: number[][] } => {
  const { direction, axis, start, width } = ribbon;
  const reach = start + JOIN_OVERLAP;
  const upper = [axis[0]! + direction[0]! * reach, axis[1]! + direction[1]! * reach];
  const lower = ribbonLowerStart(ribbon, centre, JOIN_OVERLAP);
  const side = (p: number[], k: number): number[] => [
    p[0]! - direction[1]! * k,
    p[1]! + direction[0]! * k,
  ];
  const corners = [
    side(upper, REACH),
    side(upper, -REACH),
    side(lower, -REACH),
    side(lower, REACH),
  ];
  const hw = width / 2;
  return {
    points: corners.map((p) => `${f(p[0]!)},${f(p[1]!)}`).join(" "),
    ends: [side(upper, -hw), side(upper, hw), side(lower, -hw), side(lower, hw)],
  };
};

/** In mark units: a straight run past the taper's end, then the arc's radius. */
export const TOP_BAR_BEND = { run: 140, radius: 260 };

/** The centreline of the top bar's horizontal run, and the band's half width, in mark units. */
export const ribbonTopBarLevel = (
  ribbon: RibbonGeometry,
  centre: number[],
  bend = TOP_BAR_BEND,
): { level: number; halfWidth: number } => {
  const { direction, axis, start, width } = ribbon;
  const twin = [2 * centre[0]! - axis[0]!, 2 * centre[1]! - axis[1]!];
  const d = [-direction[0]!, -direction[1]!];
  const right = [-d[1]!, d[0]!];
  const p1 = [twin[0]! + d[0]! * (start + bend.run), twin[1]! + d[1]! * (start + bend.run)];
  return { level: p1[1]! + right[1]! * bend.radius + bend.radius, halfWidth: width / 2 };
};

/**
 * The upper arm runs on to the top edge; the lower arm, after a short run, arcs into the horizontal
 * and runs left to the page's edge, so the bar's bottom edge is the ribbon itself. The arc's centre
 * sits to the right of travel, the side the turn is on.
 */
export const ribbonTopBar = (
  ribbon: RibbonGeometry,
  centre: number[],
  bend = TOP_BAR_BEND,
): string => {
  const { direction, axis, start, width } = ribbon;
  const across = [-direction[1]! * (width / 2), direction[0]! * (width / 2)];
  const at = (s: number, side: number): number[] => [
    axis[0]! + direction[0]! * s + across[0]! * side,
    axis[1]! + direction[1]! * s + across[1]! * side,
  ];
  const upper = subpath([at(start, -1), at(REACH, -1), at(REACH, 1), at(start, 1)]);
  const twin = [2 * centre[0]! - axis[0]!, 2 * centre[1]! - axis[1]!];
  const d = [-direction[0]!, -direction[1]!];
  const right = [-d[1]!, d[0]!];
  const left = [d[1]!, -d[0]!];
  const along = (s: number): number[] => [twin[0]! + d[0]! * s, twin[1]! + d[1]! * s];
  const p0 = along(start);
  const p1 = along(start + bend.run);
  const r = bend.radius;
  const c = [p1[0]! + right[0]! * r, p1[1]! + right[1]! * r];
  const { level } = ribbonTopBarLevel(ribbon, centre, bend);
  const hw = width / 2;
  const off = (p: number[], k: number): string =>
    `${f(p[0]! + left[0]! * k)} ${f(p[1]! + left[1]! * k)}`;
  const lower =
    `M ${off(p0, hw)} L ${off(p1, hw)} A ${f(r + hw)} ${f(r + hw)} 0 0 1 ${f(c[0]!)} ${f(level + hw)} ` +
    `L ${-REACH} ${f(level + hw)} L ${-REACH} ${f(level - hw)} L ${f(c[0]!)} ${f(level - hw)} ` +
    `A ${f(r - hw)} ${f(r - hw)} 0 0 0 ${off(p1, -hw)} L ${off(p0, -hw)} Z`;
  return `${upper} ${lower}`;
};

/**
 * Each rectangle continues a drawn arm outward from `start`, where the taper reaches full width,
 * overlapping the drawn arm instead of abutting it so there is no edge to show.
 */
export const ribbonArms = (ribbon: RibbonGeometry, centre: number[]): string => {
  const { direction, axis, start, width } = ribbon;
  const across = [-direction[1]! * (width / 2), direction[0]! * (width / 2)];
  const at = (s: number, side: number): number[] => [
    axis[0]! + direction[0]! * s + across[0]! * side,
    axis[1]! + direction[1]! * s + across[1]! * side,
  ];
  const arm = [at(start, -1), at(REACH, -1), at(REACH, 1), at(start, 1)];
  const turn = (p: number[]): number[] => [2 * centre[0]! - p[0]!, 2 * centre[1]! - p[1]!];
  return `${subpath(arm)} ${subpath(arm.map(turn))}`;
};

/**
 * A centre line an arm grows along, from its square end at the full-width point outward (`d`), and
 * how it leaves any box: `pre` mark units of path, then straight on from `from` along `toward`.
 */
export interface Growth {
  d: string;
  pre: number;
  from: number[];
  toward: number[];
}

/**
 * The two arms' growth lines, upper first: straight out for the hero's arms, along the bend into the
 * horizontal run for the top bar's lower arm.
 */
export const ribbonGrowth = (
  ribbon: RibbonGeometry,
  centre: number[],
  topBar: boolean,
  bend = TOP_BAR_BEND,
): [Growth, Growth] => {
  const { direction, axis, start } = ribbon;
  const d = [-direction[0]!, -direction[1]!];
  const upper = [axis[0]! + direction[0]! * start, axis[1]! + direction[1]! * start];
  const lower = ribbonLowerStart(ribbon, centre);
  const ray = (p: number[], v: number[]): string =>
    `M ${f(p[0]!)} ${f(p[1]!)} L ${f(p[0]! + v[0]! * REACH)} ${f(p[1]! + v[1]! * REACH)}`;
  const up: Growth = { d: ray(upper, direction), pre: 0, from: upper, toward: direction };
  if (!topBar) return [up, { d: ray(lower, d), pre: 0, from: lower, toward: d }];
  const r = bend.radius;
  const p1 = [lower[0]! + d[0]! * bend.run, lower[1]! + d[1]! * bend.run];
  const cx = p1[0]! - d[1]! * r;
  const { level } = ribbonTopBarLevel(ribbon, centre, bend);
  // The arc turns the band from its own direction into the horizontal, leftward.
  const turn = Math.acos(-d[0]!);
  return [
    up,
    {
      d:
        `M ${f(lower[0]!)} ${f(lower[1]!)} L ${f(p1[0]!)} ${f(p1[1]!)} ` +
        `A ${r} ${r} 0 0 1 ${f(cx)} ${f(level)} L ${-REACH} ${f(level)}`,
      pre: bend.run + r * turn,
      from: [cx, level],
      toward: [-1, 0],
    },
  ];
};
