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
  // The S is its spine offset by half the line width either side; a page that draws the S in the
  // order the stroke runs needs the spine, from the upper arm's joint to the lower one's.
  // @ts-expect-error configurator globals
  const { spine } = build(state) as { spine: [number, number][] };
  const span: [number, number] = [twin[0] - axis[0], twin[1] - axis[1]];
  return {
    // @ts-expect-error configurator globals
    withBg: svgString(state, textureUri, true) as string,
    // @ts-expect-error configurator globals
    transparent: svgString(state, textureUri, false) as string,
    angleDeg,
    spine,
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
// Every fourth sample: the spine's curvature is gentle enough that the dropped points sit within a
// hundredth of a unit of the chords, and the file stays a few kilobytes.
const spine = result.spine.filter((_, i, all) => i % 4 === 0 || i === all.length - 1);
const geometry = {
  angleDeg: round(result.angleDeg, 2),
  spine: {
    units: "viewBox user units, from the upper arm's joint through the S to the lower arm's",
    lineWidth: settings.lineWidth as number,
    points: spine.map((p) => p.map((n) => round(n, 2))),
  },
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

await browser.close();

console.log(
  `exported mark.svg, mark-transparent.svg, angle ${geometry.angleDeg}°, ` +
    `ribbon width ${geometry.ribbon.width}, arm offset ${geometry.ribbon.offset}`,
);
