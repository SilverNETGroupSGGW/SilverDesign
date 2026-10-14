// The inputs spell out every command letter at four decimals. A tenth of a user unit is lossless on
// screen: the mark renders at 32–288 px from a 600-unit viewBox, the plaque at 45–164 px from a
// 922-unit one.
export const compactPath = (data: string): string => {
  let out = "";
  let command = "";
  let separate = false;
  for (const token of data.match(/[A-Za-z]|-?\d*\.?\d+/g) ?? []) {
    if (/[A-Za-z]/.test(token)) {
      // Every repeated command is implicit except "M": eliding it would turn a new subpath into a
      // line.
      if (token !== command || token === "M") {
        out += token;
        separate = false;
      }
      command = token;
      continue;
    }
    const value = String(Math.round(Number(token) * 10) / 10);
    if (separate && !value.startsWith("-")) out += " ";
    out += value;
    separate = true;
  }
  return out;
};

/**
 * Drops the points of an M/L/Z outline that lie within `tolerance` user units of the line through
 * their neighbours (Ramer–Douglas–Peucker, per subpath). The exported mark samples its curves every
 * two units, which a 16–64 px icon cannot show.
 */
export const simplifyPolyline = (data: string, tolerance: number): string => {
  const subpaths: [number, number][][] = [];
  const tokens = data.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  let current: [number, number][] = [];
  for (let i = 0; i < tokens.length;) {
    const token = tokens[i]!;
    if (/[A-Za-z]/.test(token)) {
      if (!/[MLZ]/.test(token)) throw new Error(`simplifyPolyline: unsupported command ${token}`);
      if ((token === "M" || token === "Z") && current.length > 0) {
        subpaths.push(current);
        current = [];
      }
      i += 1;
      continue;
    }
    current.push([Number(token), Number(tokens[i + 1])]);
    i += 2;
  }
  if (current.length > 0) subpaths.push(current);

  const keep = (points: [number, number][]): [number, number][] => {
    if (points.length < 3) return points;
    const [ax, ay] = points[0]!;
    const [bx, by] = points.at(-1)!;
    const length = Math.hypot(bx - ax, by - ay);
    let farthest = 0;
    let at = 0;
    for (let k = 1; k < points.length - 1; k += 1) {
      const [px, py] = points[k]!;
      const d =
        length === 0
          ? Math.hypot(px - ax, py - ay)
          : Math.abs((px - ax) * (by - ay) - (py - ay) * (bx - ax)) / length;
      if (d > farthest) {
        farthest = d;
        at = k;
      }
    }
    if (farthest <= tolerance) return [points[0]!, points.at(-1)!];
    return [...keep(points.slice(0, at + 1)).slice(0, -1), ...keep(points.slice(at))];
  };

  return subpaths
    .map(
      (points) =>
        `M${keep(points)
          .map(([x, y]) => `${x} ${y}`)
          .join("L")}Z`,
    )
    .join("");
};
