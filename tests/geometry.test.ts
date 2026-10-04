import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  JOIN_OVERLAP,
  ribbonGrowth,
  ribbonSlab,
  ribbonTopBarLevel,
  TOP_BAR_BEND,
} from "../src/lib/ribbon";

const geometry = JSON.parse(
  readFileSync(join(import.meta.dir, "..", "brand", "logo", "geometry.json"), "utf8"),
) as {
  angleDeg: number;
  ribbon: { direction: number[]; axis: number[]; start: number; width: number; offset: number };
};

describe("brand/logo/geometry.json", () => {
  test("carries the one diagonal the whole system uses", () => {
    expect(geometry.angleDeg).toBeGreaterThan(20);
    expect(geometry.angleDeg).toBeLessThan(40);
  });

  test("the ribbon axis is a unit direction at that angle", () => {
    const [dx, dy] = geometry.ribbon.direction as [number, number];
    expect(Math.hypot(dx, dy)).toBeCloseTo(1, 4);
    expect(dx).toBeGreaterThan(0);
    // SVG y grows downward, so an axis rising to the right runs negative in y.
    expect(dy).toBeLessThan(0);
    expect((Math.atan2(-dy, dx) * 180) / Math.PI).toBeCloseTo(geometry.angleDeg, 1);
  });

  test("the axis point and arm width sit inside the exported viewBox", () => {
    const [x, y] = geometry.ribbon.axis as [number, number];
    expect(x).toBeGreaterThan(300);
    expect(x).toBeLessThan(900);
    expect(y).toBeGreaterThan(300);
    expect(y).toBeLessThan(900);
    expect(geometry.ribbon.width).toBeGreaterThan(0);
    expect(geometry.ribbon.width).toBeLessThan(600);
    // The ribbon only continues the arm from where the taper has run out, well short of the frame.
    expect(geometry.ribbon.start).toBeGreaterThan(0);
    expect(geometry.ribbon.start).toBeLessThan(300);
  });

  test("the two arms are parallel but offset, so one straight ribbon cannot hold both", () => {
    expect(geometry.ribbon.offset).toBeGreaterThan(geometry.ribbon.width);
  });
});

describe("the lockup's flight between the hero and the navigation", () => {
  // The exported viewBox is 300 300 600 600.
  const centre = [600, 600];
  const { direction: d, axis, start, width } = geometry.ribbon;
  const twin = [2 * centre[0]! - axis[0]!, 2 * centre[1]! - axis[1]!];
  const along = (p: number[], from: number[]): number =>
    (p[0]! - from[0]!) * d[0]! + (p[1]! - from[1]!) * d[1]!;

  test("the flying S overlaps both arms' square ends, short of the top bar's bend", () => {
    expect(JOIN_OVERLAP).toBeGreaterThan(0);
    expect(JOIN_OVERLAP).toBeLessThan(TOP_BAR_BEND.run);
    const { ends } = ribbonSlab(geometry.ribbon, centre);
    const [u0, u1, l0, l1] = ends as [number[], number[], number[], number[]];
    for (const p of [u0, u1]) expect(along(p, axis)).toBeCloseTo(start + JOIN_OVERLAP, 3);
    for (const p of [l0, l1]) expect(along(p, twin)).toBeCloseTo(-(start + JOIN_OVERLAP), 3);
    expect(Math.hypot(u0[0]! - u1[0]!, u0[1]! - u1[1]!)).toBeCloseTo(width, 3);
  });

  test("the arms grow from their square ends, the top bar's lower one out of its bend", () => {
    for (const topBar of [false, true]) {
      const [up, low] = ribbonGrowth(geometry.ribbon, centre, topBar);
      expect(along(up.from, axis)).toBeCloseTo(start, 3);
      expect(up.toward).toEqual(d);
      if (!topBar) expect(along(low.from, twin)).toBeCloseTo(-start, 3);
    }
    const [, bar] = ribbonGrowth(geometry.ribbon, centre, true);
    expect(bar.toward).toEqual([-1, 0]);
    expect(bar.from[1]).toBeCloseTo(ribbonTopBarLevel(geometry.ribbon, centre).level, 6);
    const turn = Math.acos(d[0]!);
    expect(bar.pre).toBeCloseTo(TOP_BAR_BEND.run + TOP_BAR_BEND.radius * turn, 6);
  });
});
