import lockupJson from "../../brand/logo/lockup.json?raw";
import { markSlab } from "./mark";

const lockup = JSON.parse(lockupJson) as {
  path: string;
  bodyBox: [number, number, number, number];
  wordBox: [number, number, number, number];
};

/** The word "ilver", as outlines in the mark's own user units. */
export const lockupPath = lockup.path;
const r = (n: number): number => Math.round(n * 10) / 10;

type Box = { x: number; y: number; w: number; h: number };
const corners = ([x, y, w, h]: [number, number, number, number]): number[][] => [
  [x, y],
  [x + w, y + h],
];
/** The pad keeps the strokes off the edges. */
const around = (points: number[][], pad = 12): Box => {
  const xs = points.map((p) => p[0]!);
  const ys = points.map((p) => p[1]!);
  const [x0, y0] = [Math.min(...xs) - pad, Math.min(...ys) - pad];
  const [x1, y1] = [Math.max(...xs) + pad, Math.max(...ys) + pad];
  return { x: r(x0), y: r(y0), w: r(x1 - x0), h: r(y1 - y0) };
};

/** The S and the word: the box the navigation's row centres on, with the arms running out of it. */
export const lockupTightBox = around([...corners(lockup.bodyBox), ...corners(lockup.wordBox)]);

/**
 * What flies between the hero and the navigation's corner on a page change: the S out to where it
 * overlaps the arms' square ends (markSlab), and the word. The lower arm's taper reaches past the
 * tight box, which would cut it short of the line the ribbon left behind ends on.
 */
export const lockupFlightBox = around([
  ...corners(lockup.bodyBox),
  ...markSlab.ends,
  ...corners(lockup.wordBox),
]);
