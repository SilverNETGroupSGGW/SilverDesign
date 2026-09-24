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
