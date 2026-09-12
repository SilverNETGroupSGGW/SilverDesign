// The logo configurator exports a flattened polyline with one explicit "L" per segment and four
// decimal places; the lockup's word arrives from opentype as "Q"/"C" curves written the same way.
// Rounding to a tenth of a user unit (the mark renders at 32–288 px from a 600-unit viewBox, the
// plaque at 45–164 px from a 922-unit one) and dropping the repeated command letters is lossless on
// screen — a repeat is implicit for every command except "M", curves included.
export const compactPath = (data: string): string => {
  let out = "";
  let command = "";
  let separate = false;
  for (const token of data.match(/[A-Za-z]|-?\d*\.?\d+/g) ?? []) {
    if (/[A-Za-z]/.test(token)) {
      // A repeated "L" is implicit after the first one; a repeated "M" is not — eliding it would
      // turn a new subpath into a line.
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
