import { describe, expect, test } from "bun:test";
import { wheels } from "../src/lib/odometer";

describe("the history's year wheels", () => {
  test("turn only the digits that change", () => {
    expect(wheels("2015", "2016").map((w) => w.ticks)).toEqual([0, 0, 0, 1]);
  });
  test("count forward through 0, carrying into the next wheel", () => {
    expect(wheels("2019", "2021")).toEqual([
      { from: 2, to: 2, ticks: 0 },
      { from: 0, to: 0, ticks: 0 },
      { from: 1, to: 2, ticks: 1 },
      { from: 9, to: 11, ticks: 2 },
    ]);
  });
  test("stand still when no time has passed", () => {
    expect(wheels("2018", "2018").every((w) => w.ticks === 0)).toBe(true);
  });
});
