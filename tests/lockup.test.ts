import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const brand = join(import.meta.dir, "..", "brand", "logo");
const read = (file: string): unknown => JSON.parse(readFileSync(join(brand, file), "utf8"));

const lockup = read("lockup.json") as {
  font: { family: string; weight: number; file: string };
  capRatio: number;
  gapU: number;
  stemU: number;
  strokeU: number;
  word: {
    text: string;
    fontSizeU: number;
    angleDeg: number;
    origin: number[];
    glyphs: { ch: string; penEm: number }[];
  };
  path: string;
  wordBox: number[];
  frame: number[];
  markViewBox: number[];
  bodyBox: number[];
};
const geometry = read("geometry.json") as {
  ribbon: { direction: number[]; axis: number[]; start: number };
};

/** The S body's box in mark user units: the last subpath of the mark path. */
const BODY = { l: 448.4, r: 751.6, t: 438.6, b: 761.4 };

describe("brand/logo/lockup.json", () => {
  test("carries the word as outlines of a named cut of Syncopate", () => {
    expect(lockup.font.family).toBe("Syncopate");
    expect(lockup.font.weight).toBe(700);
    expect(lockup.font.file).toBe("brand/fonts/Syncopate-Bold.ttf");
    expect(lockup.word.text).toBe("ilver");
    expect(lockup.word.glyphs.map((g) => g.ch).join("")).toBe("ilver");
    expect(lockup.path.startsWith("M")).toBe(true);
    expect(lockup.path.length).toBeGreaterThan(100);
  });

  test("the letters are cut from the S: one stroke, one gap, one cap height", () => {
    expect(lockup.capRatio).toBeGreaterThanOrEqual(0.53);
    expect(lockup.capRatio).toBeLessThanOrEqual(0.59);
    expect(lockup.gapU).toBeGreaterThanOrEqual(56);
    expect(lockup.gapU).toBeLessThanOrEqual(68);
    expect(lockup.stemU).toBeGreaterThanOrEqual(48);
    expect(lockup.stemU).toBeLessThanOrEqual(52);
    // Anything the eye could catch has to be answered by a heavier cut, not by outlining the word.
    expect(lockup.strokeU).toBeLessThan(1);
  });

  test("the pen runs left to right and starts at the origin", () => {
    expect(lockup.word.fontSizeU).toBeGreaterThan(0);
    const pens = lockup.word.glyphs.map((g) => g.penEm);
    expect(pens[0]).toBe(0);
    for (let i = 1; i < pens.length; i++) expect(pens[i]!).toBeGreaterThan(pens[i - 1]!);
  });

  test("the plaque is 900:460 and holds the whole S body", () => {
    const [x, y, w, h] = lockup.frame as [number, number, number, number];
    expect(w / h).toBeCloseTo(900 / 460, 2);
    expect(x).toBeLessThan(BODY.l);
    expect(y).toBeLessThan(BODY.t);
    expect(x + w).toBeGreaterThan(BODY.r);
    expect(y + h).toBeGreaterThan(BODY.b);
  });

  test("the boxes the page lays text out against come from the export", () => {
    const [vbX, vbY, vbSize] = lockup.markViewBox as [number, number, number];
    expect([vbX, vbY, vbSize]).toEqual([300, 300, 600]);
    expect(lockup.bodyBox.map((n) => Math.round(n * 10) / 10)).toEqual(
      [BODY.l, BODY.t, BODY.r - BODY.l, BODY.b - BODY.t].map((n) => Math.round(n * 10) / 10),
    );
    const [x, y, w, h] = lockup.wordBox as [number, number, number, number];
    // The word starts at the S's end, runs out past the mark box's right edge, and stays above the
    // S's bottom.
    expect(x).toBeGreaterThan(BODY.r - lockup.gapU * 4);
    expect(x + w).toBeGreaterThan(vbX + vbSize);
    expect(y).toBeGreaterThan(vbY - vbSize);
    expect(y + h).toBeLessThan(BODY.b);
    expect(h).toBeGreaterThan(lockup.capRatio * (BODY.b - BODY.t));
  });

  test("the word hangs under the arm, past the notch the ribbon starts at", () => {
    const { direction, axis, start } = geometry.ribbon;
    const notchX = axis[0]! + direction[0]! * start;
    expect(lockup.word.origin[0]!).toBeGreaterThan(notchX);
    // The word is parallel to the arm, which rises to the right, so it turns the other way in SVG.
    expect(lockup.word.angleDeg).toBeLessThan(0);
  });
});
