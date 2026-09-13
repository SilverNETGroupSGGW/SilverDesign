import lockupJson from "../../brand/logo/lockup.json?raw";

const lockup = JSON.parse(lockupJson) as {
  path: string;
  bodyBox: [number, number, number, number];
  wordBox: [number, number, number, number];
};

/** The word "ilver", as outlines in the mark's own user units. */
export const lockupPath = lockup.path;
/**
 * The S and the word, tight, as a viewBox for the small lockup in a page's navigation: the arms are
 * cut where the box ends, so the ribbon reads as leaving it. A hair of room keeps the strokes off
 * the edges.
 */
const r = (n: number): number => Math.round(n * 10) / 10;

export const lockupTightBox = ((): { x: number; y: number; w: number; h: number } => {
  const [bx, by, bw, bh] = lockup.bodyBox;
  const [wx, wy, ww, wh] = lockup.wordBox;
  const pad = 12;
  const x0 = Math.min(bx, wx) - pad;
  const y0 = Math.min(by, wy) - pad;
  const x1 = Math.max(bx + bw, wx + ww) + pad;
  const y1 = Math.max(by + bh, wy + wh) + pad;
  return { x: r(x0), y: r(y0), w: r(x1 - x0), h: r(y1 - y0) };
})();
