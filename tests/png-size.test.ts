import { expect, test } from "bun:test";
import { pngSize } from "../scripts/png-size";

const png = (w: number, h: number) => {
  const b = new Uint8Array(24);
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  new DataView(b.buffer).setUint32(16, w);
  new DataView(b.buffer).setUint32(20, h);
  return b;
};

test("reads width and height from IHDR", () => {
  expect(pngSize(png(2480, 3508))).toEqual({ width: 2480, height: 3508 });
});

test("rejects non-PNG bytes", () => {
  expect(() => pngSize(new Uint8Array(24))).toThrow("not a PNG");
});
