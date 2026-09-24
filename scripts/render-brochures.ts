/* oxlint-disable no-await-in-loop -- one Playwright page is reused, so the four renders must be sequential */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { pngSize } from "./png-size";

const WIDTH = 1240;
const HEIGHT = 1754;
const SCALE = 2;

const root = resolve(import.meta.dir, "..");
const dist = join(root, "dist");
const out = join(dist, "brochure");
mkdirSync(out, { recursive: true });

const boxPairs = (n: number): number => (n * (n - 1)) / 2;

// The base the site was built with (the Pages workflow sets it for the build and for this step):
// dist/ holds the pages without it, and their links and assets carry it.
const BASE = (process.env.SITE_BASE ?? "/").replace(/\/?$/, "/");

const jobs = [
  { path: `${BASE}pl/broszura/studenci/`, file: "silver-studenci-pl.png" },
  { path: `${BASE}pl/broszura/firmy/`, file: "silver-firmy-pl.png" },
  { path: `${BASE}en/brochure/students/`, file: "silver-students-en.png" },
  { path: `${BASE}en/brochure/companies/`, file: "silver-companies-en.png" },
];

const server = Bun.serve({
  port: 0,
  hostname: "127.0.0.1",
  fetch: async (req) => {
    const url = new URL(req.url);
    const site = url.pathname.startsWith(BASE) ? url.pathname.slice(BASE.length - 1) : url.pathname;
    const path = site.endsWith("/") ? `${site}index.html` : site;
    const file = Bun.file(join(dist, path));
    return (await file.exists()) ? new Response(file) : new Response("not found", { status: 404 });
  },
});

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: SCALE,
});

let failed = false;
for (const job of jobs) {
  await page.goto(`http://127.0.0.1:${server.port}${job.path}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  // The lead's line script lays out again in a frame after the fonts land; measure after it.
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  );
  const metrics = await page.evaluate(() => {
    const el = document.querySelector(".page")!;
    const rect = el.getBoundingClientRect();
    // Every box that clips, not only the sheet: a card losing a line does not move the sheet's own
    // scroll size.
    const clipped = [...el.querySelectorAll<HTMLElement>("*")].filter((node) => {
      // The visually-hidden utility clips by design: a 1 px box carrying an accessible name.
      if (node.classList.contains("visually-hidden")) return false;
      const style = getComputedStyle(node);
      return (
        style.overflowX !== "visible" || style.overflowY !== "visible" || style.clipPath !== "none"
      );
    });
    const cut = [el, ...clipped]
      .filter(
        (node) =>
          node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1,
      )
      .map((node) => {
        const name = `${node.tagName.toLowerCase()}.${[...node.classList].join(".")}`;
        return `${name} by ${node.scrollWidth - node.clientWidth}×${node.scrollHeight - node.clientHeight} px`;
      });
    // The clip check misses blocks that land on top of each other.
    const boxes = [...el.children]
      .filter((node): node is HTMLElement => node instanceof HTMLElement)
      .map((node) => ({
        name: `${node.tagName.toLowerCase()}.${[...node.classList].join(".")}`,
        box: node.getBoundingClientRect(),
      }))
      .filter((entry) => entry.box.width > 0 && entry.box.height > 0);
    const overlaps: string[] = [];
    for (const [i, a] of boxes.entries()) {
      for (const b of boxes.slice(i + 1)) {
        const dx = Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left);
        const dy = Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top);
        if (dx > 1 && dy > 1) {
          overlaps.push(`${a.name} and ${b.name} by ${Math.round(dx)}×${Math.round(dy)} px`);
        }
      }
    }
    return {
      overlaps,
      blocks: boxes.length,
      overflowX: el.scrollWidth - el.clientWidth,
      overflowY: el.scrollHeight - el.clientHeight,
      width: rect.width,
      height: rect.height,
      checked: clipped.length + 1,
      cut,
    };
  });
  if (metrics.overlaps.length > 0) {
    console.error(`${job.path}: blocks overlap: ${metrics.overlaps.join(", ")}`);
    failed = true;
  }
  if (metrics.cut.length > 0) {
    console.error(`${job.path}: content is cut off in ${metrics.cut.join(", ")}`);
    failed = true;
  }
  if (metrics.overflowX > 0 || metrics.overflowY > 0) {
    console.error(
      `${job.path}: content overflows the page by ${metrics.overflowX}×${metrics.overflowY} px`,
    );
    failed = true;
  }
  if (metrics.width !== WIDTH || metrics.height !== HEIGHT) {
    console.error(
      `${job.path}: .page is ${metrics.width}×${metrics.height} CSS px, expected ${WIDTH}×${HEIGHT}`,
    );
    failed = true;
  }
  const png = await page.screenshot({
    type: "png",
    clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
  });
  const size = pngSize(png);
  if (size.width !== WIDTH * SCALE || size.height !== HEIGHT * SCALE) {
    console.error(`${job.file}: got ${size.width}×${size.height}`);
    failed = true;
  }
  writeFileSync(join(out, job.file), png);
  console.log(
    `${job.file} ${size.width}×${size.height}, ${metrics.checked} boxes checked for cut content, ` +
      `${boxPairs(metrics.blocks)} block pairs checked for overlap`,
  );
}

await browser.close();
server.stop();
process.exit(failed ? 1 : 0);
