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

const jobs = [
  { path: "/pl/broszura/studenci/", file: "silver-studenci-pl.png" },
  { path: "/pl/broszura/firmy/", file: "silver-firmy-pl.png" },
  { path: "/en/brochure/students/", file: "silver-students-en.png" },
  { path: "/en/brochure/companies/", file: "silver-companies-en.png" },
];

const server = Bun.serve({
  port: 0,
  hostname: "127.0.0.1",
  fetch: async (req) => {
    const url = new URL(req.url);
    const path = url.pathname.endsWith("/") ? `${url.pathname}index.html` : url.pathname;
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
  const metrics = await page.evaluate(() => {
    const el = document.querySelector(".page")!;
    const rect = el.getBoundingClientRect();
    // Every box that clips: the sheet itself, the plate and the cards (their corner cut), the
    // codes. One of those losing a line does not move the sheet's own scroll size, which is how a
    // card shipped with its last line cut once already.
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
    return {
      overflowX: el.scrollWidth - el.clientWidth,
      overflowY: el.scrollHeight - el.clientHeight,
      width: rect.width,
      height: rect.height,
      checked: clipped.length + 1,
      cut,
    };
  });
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
    `${job.file} ${size.width}×${size.height}, ${metrics.checked} boxes checked for cut content`,
  );
}

await browser.close();
server.stop();
process.exit(failed ? 1 : 0);
