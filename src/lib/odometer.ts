/** `from` and `to` index a column of 0–9 written out twice, so `to` may pass 9. */
export interface Wheel {
  from: number;
  to: number;
  ticks: number;
}

/**
 * A wheel only counts up, so 9 → 1 turns through 0 (two ticks). `from` and `to` are digit strings
 * of the same length.
 */
export const wheels = (from: string, to: string): Wheel[] =>
  [...to].map((digit, i) => {
    const start = Number(from[i]);
    const ticks = (Number(digit) - start + 10) % 10;
    return { from: start, to: start + ticks, ticks };
  });
