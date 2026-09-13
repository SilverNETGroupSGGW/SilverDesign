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
 * The two arm polygons, as one path: each rectangle continues a drawn arm outward from `start`, the
 * distance at which the taper has reached full width. They overlap the drawn arm instead of abutting
 * it, so there is no edge to show. The second is the first turned about the mark's centre.
 */
/**
 * One straight band along the upper arm's axis, both ways, for the pages that carry the ribbon
 * without the S: there is no jog to turn about, so the arm's line simply runs through.
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
 * The ribbon as a page's top bar carries it: the upper arm runs on to the top edge as it does
 * everywhere, and the lower arm, after a short run, turns through an arc into the horizontal and
 * runs left to the page's edge, so the bar's bottom edge is the ribbon itself. `run` and `radius`
 * are in the mark's units; the arc's centre sits to the right of travel, the side the turn is on.
 */
/**
 * Where the lower arm reaches full width, in the mark's units: the mark's own arm is cut there on
 * the top bar, and the bent band takes over on the same line.
 */
export const ribbonLowerStart = (ribbon: RibbonGeometry, centre: number[]): number[] => {
  const { direction, axis, start } = ribbon;
  const twin = [2 * centre[0]! - axis[0]!, 2 * centre[1]! - axis[1]!];
  return [twin[0]! - direction[0]! * start, twin[1]! - direction[1]! * start];
};

export const ribbonTopBar = (
  ribbon: RibbonGeometry,
  centre: number[],
  bend = { run: 20, radius: 300 },
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
  const level = c[1]! + r;
  const hw = width / 2;
  const off = (p: number[], k: number): string =>
    `${f(p[0]! + left[0]! * k)} ${f(p[1]! + left[1]! * k)}`;
  const lower =
    `M ${off(p0, hw)} L ${off(p1, hw)} A ${f(r + hw)} ${f(r + hw)} 0 0 1 ${f(c[0]!)} ${f(level + hw)} ` +
    `L ${-REACH} ${f(level + hw)} L ${-REACH} ${f(level - hw)} L ${f(c[0]!)} ${f(level - hw)} ` +
    `A ${f(r - hw)} ${f(r - hw)} 0 0 0 ${off(p1, -hw)} L ${off(p0, -hw)} Z`;
  return `${upper} ${lower}`;
};

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
