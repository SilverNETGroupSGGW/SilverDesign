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
writeFileSync(join(out, "mark.svg"), result.withBg);
writeFileSync(join(out, "mark-transparent.svg"), result.transparent);
writeFileSync(
  join(out, "geometry.json"),
  JSON.stringify({ angleDeg: result.angleDeg }, null, 2) + "\n",
);

const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
// A page built with setContent has an opaque origin, so a file:// @font-face URL is refused and
// the wordmark would silently fall back to the platform sans.
const geist = await Bun.file(join(root, "public", "fonts", "Geist-Variable.woff2")).bytes();
await og.setContent(`<!doctype html>
<style>
  @font-face {
    font-family: "Geist";
    src: url("data:font/woff2;base64,${Buffer.from(geist).toString("base64")}") format("woff2");
    font-weight: 100 900;
  }
  html, body { margin: 0; height: 100%; }
  body {
    background: #16161b;
    color: #d8dbde;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 56px;
    font-family: "Geist", sans-serif;
  }
  svg { width: 380px; height: 380px; }
  p { margin: 0; font-size: 104px; font-weight: 600; letter-spacing: -0.02em; }
</style>
${result.transparent}
<p>Silver</p>`);
await og.evaluate(() => document.fonts.ready);
await og.screenshot({ path: join(root, "public", "og.png") });
await browser.close();

console.log(`exported mark.svg, mark-transparent.svg, og.png, angle ${result.angleDeg}°`);
