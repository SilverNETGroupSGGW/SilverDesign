import geometryJson from "../../brand/logo/geometry.json?raw";
import markSvg from "../../brand/logo/mark-transparent.svg?raw";
import { compactPath } from "./svg-path";

export const markPathId = "silver-mark-path";

// The exported SVG inlines the same 261 KB JPEG four times; pointing the tiles at the copy in
// public/ keeps the inline markup at ~31 KB instead of ~1 MB per mark.
const source = markSvg.replaceAll(/data:image\/jpeg;base64,[^"]+/g, "/brand/foil-texture.jpg");

const capture = (pattern: RegExp, label: string): string => {
  const found = pattern.exec(source)?.[1];
  if (!found) throw new Error(`brand/logo/mark-transparent.svg: no ${label}`);
  return found;
};

export const markViewBox = compactPath(capture(/viewBox="([^"]+)"/, "viewBox"));
export const markPathData = compactPath(capture(/\sd="([^"]+)"/, "path"));

const pattern = capture(/(<pattern[\s\S]*?<\/pattern>)/, "foil pattern");

export const markPattern = (uid: string): string =>
  pattern.replaceAll('id="foil"', `id="foil-${uid}"`);

const geometry = JSON.parse(geometryJson) as {
  angleDeg: number;
  ribbon: { direction: number[]; axis: number[]; start: number; width: number; offset: number };
};

const [vbX, vbY, vbSize] = markViewBox.split(" ").map(Number) as [number, number, number];
const { direction, axis, start, width } = geometry.ribbon;
const angle = (geometry.angleDeg * Math.PI) / 180;

// Far enough to leave any viewport the mark can be scaled into; the hero and the sheet clip it.
const REACH = 20000;
const turn = (p: number[]): number[] => [
  2 * (vbX + vbSize / 2) - p[0]!,
  2 * (vbY + vbSize / 2) - p[1]!,
];

// One arm: the rectangle continuing the drawn arm outward from `start`, the distance at which the
// taper has reached full width. The two overlap instead of abutting, so there is no edge to show.
const armPoints = ((): number[][] => {
  const across = [-direction[1]! * (width / 2), direction[0]! * (width / 2)];
  const at = (s: number, side: number): number[] => [
    axis[0]! + direction[0]! * s + across[0]! * side,
    axis[1]! + direction[1]! * s + across[1]! * side,
  ];
  return [at(start, -1), at(REACH, -1), at(REACH, 1), at(start, 1)];
})();

const subpath = (points: number[][]): string =>
  `M ${points.map((p) => `${p[0]} ${p[1]}`).join(" L ")} Z`;

export const markRibbonPath = compactPath(`${subpath(armPoints)} ${subpath(armPoints.map(turn))}`);

/** Where the ribbon sits in the mark's rendered box, as fractions of that box's size. */
export const markRibbon = {
  /** The centreline of the arm that leaves the box at the top right. */
  upperAxis: [(axis[0]! - vbX) / vbSize, (axis[1]! - vbY) / vbSize],
  /** Its rot180 twin, which leaves at the bottom left `offset` units across the axis. */
  lowerAxis: [(turn(axis)[0]! - vbX) / vbSize, (turn(axis)[1]! - vbY) / vbSize],
  /** Vertical distance from a centreline to the ribbon's own edge. */
  halfRise: width / 2 / Math.cos(angle) / vbSize,
  slope: Math.tan(angle),
};
