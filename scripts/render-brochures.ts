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
  await page.goto(`http://localhost:${server.port}${job.path}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const overflow = await page.evaluate(() => {
    const el = document.querySelector(".page")!;
    return { x: el.scrollWidth - el.clientWidth, y: el.scrollHeight - el.clientHeight };
  });
  if (overflow.x > 0 || overflow.y > 0) {
    console.error(`${job.path}: content overflows the page by ${overflow.x}×${overflow.y} px`);
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
  console.log(`${job.file} ${size.width}×${size.height}`);
}

await browser.close();
server.stop();
process.exit(failed ? 1 : 0);
