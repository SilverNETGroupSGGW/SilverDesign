import { mkdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import sharp from "sharp";
import subsetFont from "subset-font";

const root = resolve(import.meta.dir, "..");

const write = async (to: string, data: Buffer) => {
  mkdirSync(dirname(to), { recursive: true });
  await Bun.write(to, data);
  console.log(`${relative(root, to)} — ${(data.byteLength / 1024).toFixed(1)} KB`);
};

const texture = join(root, "brand", "foil-texture.jpg");
// The master is a print-weight JPEG; on the page it only ever renders at opacity .08 behind the
// hero band and inside the mark's foil pattern, where re-encoding is invisible.
await write(
  join(root, "public", "brand", "foil-texture.jpg"),
  await sharp(texture).jpeg({ quality: 85 }).toBuffer(),
);

// Card screenshots are cropped to one aspect so a row of cards shows one band of picture and the
// bodies start on the same line. 9:5 is the tallest the Plan WZIM shot can be: row 598 is the last
// one above the "2071, b.23 — <lecturer>" line of its first card, and spec §2.7 keeps no former
// member's name anywhere on the site.
const cardAspect = 9 / 5;
const crop = async (from: string, to: string, width: number, left = 0, top = 0) => {
  const height = Math.round(width / cardAspect);
  const source = sharp(join(root, "brand", "screenshots", from)).extract({
    left,
    top,
    width,
    height,
  });
  await write(
    join(root, "brand", "screenshots", to),
    to.endsWith(".png")
      ? await source.png().toBuffer()
      : await source.jpeg({ quality: 80 }).toBuffer(),
  );
};
// The Kampus master is captured at about twice Plan WZIM's pixel density (its app bar is 7% of the
// width against 15.6%), so it is cut 705 px wide to put both cards' UI at one scale, over the pins
// in the middle of the campus rather than the woods under its app bar.
await crop("kampus-sggw-map.jpg", "kampus-sggw-map-crop.jpg", 705, 540, 662);
await crop("plan-wzim-day.png", "plan-wzim-day-crop.png", 1077);

// Spec §8: latin + latin-ext subsets. The ranges are Google Fonts' own definitions of those two
// subsets; subset-font keeps the weight axis, so 100–900 still interpolates.
const subsetRanges: [number, number][] = [
  [0x0000, 0x00ff],
  [0x0100, 0x02ba],
  [0x02bb, 0x02bc],
  [0x02bd, 0x02c5],
  [0x02c6, 0x02c6],
  [0x02c7, 0x02cc],
  [0x02ce, 0x02d7],
  [0x02da, 0x02da],
  [0x02dc, 0x02dc],
  [0x02dd, 0x02ff],
  [0x0304, 0x0304],
  [0x0308, 0x0308],
  [0x0329, 0x0329],
  [0x0131, 0x0131],
  [0x0152, 0x0153],
  [0x1d00, 0x1dbf],
  [0x1e00, 0x1e9f],
  [0x1ef2, 0x1eff],
  [0x2000, 0x206f],
  [0x2074, 0x2074],
  [0x20a0, 0x20c0],
  [0x2113, 0x2113],
  [0x2122, 0x2122],
  [0x2191, 0x2191],
  [0x2193, 0x2193],
  [0x2212, 0x2212],
  [0x2215, 0x2215],
  [0x2c60, 0x2c7f],
  [0xa720, 0xa7ff],
  [0xfffd, 0xfffd],
];
let subsetChars = "";
for (const [from, to] of subsetRanges) {
  for (let code = from; code <= to; code += 1) subsetChars += String.fromCodePoint(code);
}
const faces = [
  ["geist-sans", "Geist-Variable.woff2"],
  ["geist-mono", "GeistMono-Variable.woff2"],
] as const;
await Promise.all(
  faces.map(async ([family, file]) => {
    const master = await Bun.file(
      join(root, "node_modules", "geist", "dist", "fonts", family, file),
    ).bytes();
    const subset = await subsetFont(Buffer.from(master), subsetChars, { targetFormat: "woff2" });
    return write(join(root, "public", "fonts", file), subset);
  }),
);
