/**
 * Under the ribbon the room for text widens line by line, so the lead's lines should grow the same
 * way, ending on the longest one. Greedy line breaking leaves the last line as a remainder instead;
 * this picks the block width and the first-line indent at which every line starts a step left of
 * the one above it. The page stays as the browser laid it out where scripts do not run.
 */
const STEPS = 24;
/**
 * Every probe is a style write read back through the line boxes, i.e. a forced layout, so the
 * indents are searched coarse first — every COARSE-th, then the bracket around the best one.
 * COARSE divides STEPS, so the widest indent is always among the coarse probes.
 */
const COARSE = 3;
/**
 * Where the lead may start, in line heights below its own top: lower in the wedge every line is
 * wider, which is what a text too long for the room at the top needs before any indent can help.
 */
const DROPS = [0, 0.5, 1, 1.5, 2];
/** The block's widths to try, as fractions of the zone: on a wide screen the width, not the foil, may set the line. */
const WIDTHS = [1, 0.8, 0.6];

const lineStarts = (range: Range): number[] => {
  const rows = new Map<number, number>();
  for (const r of range.getClientRects()) {
    if (r.width === 0) continue;
    const key = Math.round(r.top);
    rows.set(key, Math.min(rows.get(key) ?? Infinity, r.left));
  }
  return [...rows.entries()].toSorted((a, b) => a[0] - b[0]).map(([, left]) => left);
};

const same = (a: number[], b: number[]): boolean =>
  a.length === b.length && a.every((x, i) => x === b[i]);

/**
 * How far the lines fall short of each starting one step left of the one above. A step of one line
 * height is a stair the eye reads as growth; without it, two lines that happen to fill about the
 * same width read as a block with a short first line.
 */
const shortfall = (starts: number[], right: number, step: number): number => {
  const stairs = starts.reduce(
    (acc, x, i) => (i === 0 ? 0 : acc + Math.max(0, x - starts[i - 1]! + step)),
    0,
  );
  // A first line of a word or two reads as a stray, not as the top of a stair.
  const first = right - starts[0]!;
  const last = right - starts.at(-1)!;
  return stairs + Math.max(0, 0.4 * last - first);
};

export const fillWedge = (lead: HTMLElement): void => {
  lead.style.textIndent = "";
  lead.style.maxWidth = "";
  lead.style.marginBlockStart = "";
  // One range for the whole search: the text does not change, only the boxes it is laid out in.
  const range = document.createRange();
  range.selectNodeContents(lead);
  const starts = lineStarts(range);
  if (starts.length < 2) return;
  const step = parseFloat(getComputedStyle(lead).lineHeight) || 0;
  const right = lead.getBoundingClientRect().right;
  let best = { drop: 0, width: 1, indent: 0 };
  let bestScore = shortfall(starts, right, step);
  // Only a strict improvement is taken, and no score is below zero: there is nothing left to find.
  if (bestScore === 0) return;
  search: for (const drop of DROPS) {
    lead.style.marginBlockStart = `${drop * step}px`;
    let widest: number[] | undefined;
    for (const width of WIDTHS) {
      lead.style.maxWidth = `${width * 100}%`;
      lead.style.textIndent = "";
      const flush = lineStarts(range);
      // A narrower block that leaves every line where it was scores the same all the way through:
      // a line's start is the float's edge at that line's own height, and the count is unchanged.
      if (widest && same(flush, widest)) continue;
      widest ??= flush;
      // The first line's own length: an indent past most of it only pushes its words down.
      const span = right - flush[0]!;
      const scores = new Map<number, number>([[0, shortfall(flush, right, step)]]);
      const at = (i: number): number => {
        const seen = scores.get(i);
        if (seen !== undefined) return seen;
        lead.style.textIndent = `${(i / STEPS) * span * 0.8}px`;
        const score = shortfall(lineStarts(range), right, step);
        scores.set(i, score);
        return score;
      };
      let bestIndent = 0;
      let indentScore = at(0);
      const take = (i: number): void => {
        const score = at(i);
        if (score < indentScore) {
          indentScore = score;
          bestIndent = i;
        }
      };
      for (let i = COARSE; i <= STEPS; i += COARSE) take(i);
      for (
        let i = Math.max(0, bestIndent - COARSE + 1);
        i <= Math.min(STEPS, bestIndent + COARSE - 1);
        i++
      )
        take(i);
      // A run of equal scores is one answer with several indents; the narrowest of them is the one
      // a scan from zero would have stopped on.
      while (bestIndent > 0 && at(bestIndent - 1) <= indentScore) {
        bestIndent -= 1;
        indentScore = at(bestIndent);
      }
      if (indentScore < bestScore) {
        bestScore = indentScore;
        best = { drop, width, indent: (bestIndent / STEPS) * span * 0.8 };
      }
      if (indentScore === 0) break search;
    }
  }
  lead.style.marginBlockStart = best.drop ? `${best.drop * step}px` : "";
  lead.style.maxWidth = best.width < 1 ? `${best.width * 100}%` : "";
  lead.style.textIndent = best.indent ? `${best.indent}px` : "";
};

export const fillWedges = (root: ParentNode = document): void => {
  // Only the zones that carry a shaped float: without one the lead is a plain left-aligned block,
  // where the score still charges a step per line and buys a stray first-line indent — and the
  // measuring pass costs a long task for a layout it must not change.
  for (const lead of root.querySelectorAll<HTMLElement>(".opener .below:has(.sh) .lead")) {
    fillWedge(lead);
  }
};

let raf = 0;
const schedule = (): void => {
  if (!raf)
    raf = requestAnimationFrame(() => {
      raf = 0;
      fillWedges();
    });
};

/**
 * Only once the fonts are in: the faces swap, so an indent measured on the fallback would be
 * wrong and the lead would break twice.
 */
export const watchWedges = (): void => {
  void document.fonts.ready.then(schedule);
  addEventListener("resize", schedule);
};
