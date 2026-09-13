/**
 * Under the ribbon the room for text widens line by line, so the lead's lines should grow the same
 * way, ending on the longest one. Greedy line breaking leaves the last line as a remainder instead;
 * this picks the block width and the first-line indent at which every line starts a step left of
 * the one above it. The page stays as the browser laid it out where scripts do not run.
 */
const STEPS = 24;
/**
 * Where the lead may start, in line heights below its own top: lower in the wedge every line is
 * wider, which is what a text too long for the room at the top needs before any indent can help.
 */
const DROPS = [0, 0.5, 1, 1.5, 2];
/** The block's widths to try, as fractions of the zone: on a wide screen the width, not the foil, may set the line. */
const WIDTHS = [1, 0.8, 0.6];

const lineStarts = (el: HTMLElement): number[] => {
  const range = document.createRange();
  range.selectNodeContents(el);
  const rows = new Map<number, number>();
  for (const r of range.getClientRects()) {
    if (r.width === 0) continue;
    const key = Math.round(r.top);
    rows.set(key, Math.min(rows.get(key) ?? Infinity, r.left));
  }
  return [...rows.entries()].toSorted((a, b) => a[0] - b[0]).map(([, left]) => left);
};

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
  const starts = lineStarts(lead);
  if (starts.length < 2) return;
  const step = parseFloat(getComputedStyle(lead).lineHeight) || 0;
  const right = lead.getBoundingClientRect().right;
  let best = { drop: 0, width: 1, indent: 0 };
  let bestScore = shortfall(starts, right, step);
  search: for (const drop of DROPS) {
    lead.style.marginBlockStart = `${drop * step}px`;
    for (const width of WIDTHS) {
      lead.style.maxWidth = `${width * 100}%`;
      lead.style.textIndent = "";
      // The first line's own length: an indent past most of it only pushes its words down.
      const span = right - lineStarts(lead)[0]!;
      for (let i = 0; i <= STEPS; i++) {
        const indent = (i / STEPS) * span * 0.8;
        lead.style.textIndent = `${indent}px`;
        const score = shortfall(lineStarts(lead), right, step);
        if (score < bestScore) {
          bestScore = score;
          best = { drop, width, indent };
        }
        if (score === 0) break search;
      }
    }
  }
  lead.style.marginBlockStart = best.drop ? `${best.drop * step}px` : "";
  lead.style.maxWidth = best.width < 1 ? `${best.width * 100}%` : "";
  lead.style.textIndent = best.indent ? `${best.indent}px` : "";
};

export const fillWedges = (root: ParentNode = document): void => {
  // Only the openers whose zone carries a shaped float: on a backdrop page the lead is a plain
  // left-aligned block, where the score still charges a step per line and buys a stray first-line
  // indent — and the measuring pass costs a long task for a layout it must not change.
  for (const lead of root.querySelectorAll<HTMLElement>(".opener:not(.backdrop) .below .lead")) {
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
