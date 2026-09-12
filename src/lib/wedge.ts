/**
 * Under the ribbon the room for text widens line by line, so the lead's lines should grow the same
 * way, ending on the longest one. Greedy line breaking leaves the last line as a remainder instead;
 * this picks the first-line indent at which every line starts at or left of the one above it. The
 * page stays as the browser laid it out where scripts do not run.
 */
const STEPS = 24;

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

const rising = (starts: number[]): number =>
  starts.reduce((acc, x, i) => (i === 0 ? 0 : acc + Math.max(0, x - starts[i - 1]! - 1)), 0);

export const fillWedge = (lead: HTMLElement): void => {
  lead.style.textIndent = "";
  const starts = lineStarts(lead);
  if (starts.length < 2) return;
  // The first line's own room, from where it starts to the paragraph's end.
  const room = lead.getBoundingClientRect().right - starts[0]!;
  let best = 0;
  let bestScore = rising(starts);
  for (let i = 1; i <= STEPS; i++) {
    const indent = (i / STEPS) * room * 0.8;
    lead.style.textIndent = `${indent}px`;
    const score = rising(lineStarts(lead));
    if (score < bestScore) {
      bestScore = score;
      best = indent;
    }
    if (score === 0) break;
  }
  lead.style.textIndent = best ? `${best}px` : "";
};

export const fillWedges = (root: ParentNode = document): void => {
  for (const lead of root.querySelectorAll<HTMLElement>(".opener .below .lead")) fillWedge(lead);
};

let raf = 0;
const schedule = (): void => {
  if (!raf)
    raf = requestAnimationFrame(() => {
      raf = 0;
      fillWedges();
    });
};

export const watchWedges = (): void => {
  fillWedges();
  void document.fonts.ready.then(schedule);
  addEventListener("resize", schedule);
};
