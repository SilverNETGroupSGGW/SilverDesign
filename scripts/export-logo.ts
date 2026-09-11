import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = resolve(import.meta.dir, "..");
const out = join(root, "brand", "logo");
mkdirSync(out, { recursive: true });

const settings = JSON.parse(await Bun.file(join(out, "settings.json")).text());

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(join(root, "logo-configurator.html")).href);
await page.evaluate((s) => {
  // @ts-expect-error configurator globals
  applySettings(s);
}, settings);
// refreshTexture() runs from an <img> onload, so the first render is async
await page.waitForFunction(() => {
  // @ts-expect-error configurator globals
  return typeof textureUri === "string";
});

const result = await page.evaluate(() => {
  // @ts-expect-error configurator globals
  const { u2 } = bandAxis(state);
  // u2 points up-left, so its bearing is the supplement of the band's inclination
  const bearing = Math.abs((Math.atan2(u2[1], u2[0]) * 180) / Math.PI);
  const angleDeg = bearing > 90 ? 180 - bearing : bearing;
  return {
    // @ts-expect-error configurator globals
    withBg: svgString(state, textureUri, true) as string,
    // @ts-expect-error configurator globals
    transparent: svgString(state, textureUri, false) as string,
    angleDeg: Number(angleDeg.toFixed(2)),
  };
});
await browser.close();

writeFileSync(join(out, "mark.svg"), result.withBg);
writeFileSync(join(out, "mark-transparent.svg"), result.transparent);
writeFileSync(
  join(out, "geometry.json"),
  JSON.stringify({ angleDeg: result.angleDeg }, null, 2) + "\n",
);
console.log(`exported mark.svg, mark-transparent.svg, angle ${result.angleDeg}°`);
