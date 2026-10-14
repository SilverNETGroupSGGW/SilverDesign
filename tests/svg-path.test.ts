import { describe, expect, test } from "bun:test";
import { simplifyPolyline } from "../src/lib/svg-path";

describe("simplifyPolyline", () => {
  test("drops points on a straight run and keeps the corners", () => {
    expect(simplifyPolyline("M0 0L1 0L2 0L3 0L3 1L3 2Z", 0.01)).toBe("M0 0L3 0L3 2Z");
  });
  test("keeps a point further off the line than the tolerance", () => {
    expect(simplifyPolyline("M0 0L1 0.5L2 0Z", 0.25)).toBe("M0 0L1 0.5L2 0Z");
  });
  test("refuses curves", () => {
    expect(() => simplifyPolyline("M0 0Q1 1 2 0Z", 0.1)).toThrow();
  });
});
