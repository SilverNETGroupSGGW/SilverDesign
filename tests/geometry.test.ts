import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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
