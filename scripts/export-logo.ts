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
  const { u2, uo2, inn2, HW, Pouter } = bandAxis(state);
  // u2 points up-left, so its bearing is the supplement of the band's inclination
  const bearing = Math.abs((Math.atan2(u2[1], u2[0]) * 180) / Math.PI);
  const angleDeg = bearing > 90 ? 180 - bearing : bearing;

  // @ts-expect-error configurator globals
  const widthAt = bandProfile(state, HW) as (s: number) => number;
  // @ts-expect-error configurator globals
  const armWidth = state.bandWidth as number;
  // The taper runs out before the band leaves the frame; the ribbon may only continue the arm from
  // the distance where the profile has reached its full width, or it would widen the taper.
  let lo = 0;
  let hi = 900;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (widthAt(mid) >= armWidth - 1e-9) hi = mid;
    else lo = mid;
  }

  // @ts-expect-error configurator globals
  const { o, vb } = viewBox(state) as { o: number; vb: number };
  const centre = o + vb / 2;
  const axis: [number, number] = [
    Pouter[0] + inn2[0] * (armWidth / 2),
    Pouter[1] + inn2[1] * (armWidth / 2),
  ];
  const twin: [number, number] = [2 * centre - axis[0], 2 * centre - axis[1]];
  const span: [number, number] = [twin[0] - axis[0], twin[1] - axis[1]];
  return {
    // @ts-expect-error configurator globals
    withBg: svgString(state, textureUri, true) as string,
    // @ts-expect-error configurator globals
    transparent: svgString(state, textureUri, false) as string,
    angleDeg,
    ribbon: {
      units: `viewBox user units; the exported viewBox is ${o} ${o} ${vb} ${vb}`,
      direction: [uo2[0] as number, uo2[1] as number] as [number, number],
      axis,
      start: hi,
      width: armWidth,
      offset: Math.abs(span[0] * inn2[0] + span[1] * inn2[1]),
    },
  };
});
const round = (n: number, places: number): number => Number(n.toFixed(places));
const geometry = {
  angleDeg: round(result.angleDeg, 2),
  ribbon: {
    ...result.ribbon,
    direction: result.ribbon.direction.map((n) => round(n, 6)),
    axis: result.ribbon.axis.map((n) => round(n, 4)),
    start: round(result.ribbon.start, 4),
    offset: round(result.ribbon.offset, 4),
  },
};

writeFileSync(join(out, "mark.svg"), result.withBg);
writeFileSync(join(out, "mark-transparent.svg"), result.transparent);
writeFileSync(join(out, "geometry.json"), JSON.stringify(geometry, null, 2) + "\n");

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

console.log(
  `exported mark.svg, mark-transparent.svg, og.png, angle ${geometry.angleDeg}°, ` +
    `ribbon width ${geometry.ribbon.width}, arm offset ${geometry.ribbon.offset}`,
);
