/**
 * The band in the mark's user units: the arms' centre points at their joints, and the S's spine
 * length between them; `wordEnd` is along the band from `centre`.
 */
export interface UnrollFrame {
  centre: [number, number];
  dir: [number, number];
  half: number;
  lower: [number, number];
  upper: [number, number];
  spineLength: number;
  wordEnd: number;
}

/** The opener's clipping edges, in the mark's user units. */
export interface UnrollEdges {
  left: number;
  right: number;
  top: number;
}

/**
 * Along the band from the mark's centre, in mark units: `from`, where the lower arm first shows
 * inside the left edge, and `to`, past which nothing more shows: the upper arm's last point inside
 * the top or right edge, or the word's end, whichever is further. Assumes the lower arm leaves by
 * the left edge and the upper by the top or the right, which the opener's layout guarantees.
 */
export const unrollSpan = (f: UnrollFrame, e: UnrollEdges): { from: number; to: number } => {
  const [dx, dy] = f.dir;
  const [nx, ny] = [-dy, dx];
  const along = (p: [number, number]): number =>
    (p[0] - f.centre[0]) * dx + (p[1] - f.centre[1]) * dy;
  const from = along(f.lower) + (e.left - f.lower[0] - f.half * Math.abs(nx)) / dx;
  // Each of the band's two edge lines leaves by whichever of the top and the right it meets first.
  const exit = (w: number): number =>
    Math.min((e.top - f.upper[1] - w * ny) / dy, (e.right - f.upper[0] - w * nx) / dx);
  const to = Math.max(along(f.upper) + Math.max(exit(-f.half), exit(f.half)), f.wordEnd);
  return { from, to };
};

/**
 * The same span as positions of the tip on its path: up the lower arm to its joint (0), along the
 * S's spine, and out along the upper arm from its joint (spineLength).
 */
export const tipSpan = (f: UnrollFrame, e: UnrollEdges): { from: number; to: number } => {
  const along = (p: [number, number]): number =>
    (p[0] - f.centre[0]) * f.dir[0] + (p[1] - f.centre[1]) * f.dir[1];
  const { from, to } = unrollSpan(f, e);
  return { from: from - along(f.lower), to: f.spineLength + to - along(f.upper) };
};
