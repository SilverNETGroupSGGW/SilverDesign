export interface RibbonGeometry {
  direction: number[];
  axis: number[];
  start: number;
  width: number;
}

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
