import { mkdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import sharp from "sharp";
import { compactPath } from "../src/lib/svg-path";

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

const kampusMap = join(root, "brand", "screenshots", "kampus-sggw-map.jpg");
// The card shows the top of the shot in a box that is never taller than it is wide, so nothing
// below row 1600 of a 1562-wide screenshot can ever reach the screen — it is only decoded and
// thrown away. Cropping it here halves the largest variant the build emits.
await write(
  join(root, "brand", "screenshots", "kampus-sggw-map-crop.jpg"),
  await sharp(kampusMap)
    .extract({ left: 0, top: 0, width: 1562, height: 1600 })
    .jpeg({ quality: 90 })
    .toBuffer(),
);

const planDay = join(root, "brand", "screenshots", "plan-wzim-day.png");
// Spec §2.7: no former member's name ships anywhere. Row 598 is the last one above the
// "2071, b.23 — <lecturer>" line of the first card; everything below it is dropped.
await write(
  join(root, "brand", "screenshots", "plan-wzim-day-crop.png"),
  await sharp(planDay).extract({ left: 0, top: 0, width: 1077, height: 598 }).png().toBuffer(),
);

const mark = await Bun.file(join(root, "brand", "logo", "mark.svg")).text();
const viewBox = /viewBox="([^"]+)"/.exec(mark)?.[1];
const outline = /\sd="([^"]+)"/.exec(mark)?.[1];
if (!viewBox || !outline) throw new Error("brand/logo/mark.svg: no viewBox or path");
// The configurator's export carries the foil tiles the favicon can never show at 32 px, so the
// icon is the same geometry flattened to the two brand greys.
const box = compactPath(viewBox).split(" ");
await write(
  join(root, "public", "favicon.svg"),
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${compactPath(viewBox)}" width="1200" height="1200">` +
      `<rect x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}" fill="#16161B"/>` +
      `<path d="${compactPath(outline)}" fill="#D8DBDE"/>` +
      `</svg>\n`,
  ),
);
