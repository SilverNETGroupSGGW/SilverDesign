import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dir, "..");

// Charmander has no screens of its own: it is two backends behind one contract. Its card shows that
// contract instead, the same endpoint as each implementation writes it, verbatim from the repo
// (brand/code/charmander, each file headed by its source path and commit URL).
const panes = [
  { file: "register-device.cs", stack: ".NET Minimal API" },
  { file: "register-device.py", stack: "FastAPI" },
];

// The card's 9:5 at twice the width the cards render it. The cards cut up to a tenth off the bottom
// (max-height in ProjectCard.astro), so both excerpts end above that.
const WIDTH = 1440;
const HEIGHT = 800;

const keywords = new Set(["app", "async", "await", "var", "new", "return", "def", "with", "print"]);

const escape = (s: string): string =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

// No hue (DESIGN.md, the No-Hue Rule): the grammar is set in the site's three greys, keywords in
// Polished Highlight, strings receding to Pewter Muted.
const highlight = (line: string): string =>
  line.replace(
    /(\$?f?"(?:[^"\\]|\\.)*")|(@[\w.]+)|\b([A-Za-z_]\w*)\b|([^"@A-Za-z_]+)/g,
    (match, str: string, deco: string, word: string) => {
      if (str) return `<span class="s">${escape(str)}</span>`;
      if (deco || (word && keywords.has(word))) return `<span class="k">${escape(match)}</span>`;
      return escape(match);
    },
  );

const pane = ({ file, stack }: (typeof panes)[number]): string => {
  const text = readFileSync(join(root, "brand", "code", "charmander", file), "utf8");
  const [head = "", , , ...code] = text.trimEnd().split("\n");
  const [, path = "", from = "1"] = /source: (\S+) lines (\d+)/.exec(head) ?? [];
  const indent = Math.min(...code.filter((l) => l.trim()).map((l) => /^ */.exec(l)![0].length));
  const lines = code
    .map((l, i) => `<span class="n">${Number(from) + i}</span>${highlight(l.slice(indent))}`)
    .join("\n");
  return `<section><header><span class="mark"></span>${escape(path)}<span class="stack">${stack}</span></header><pre>${lines}</pre></section>`;
};

const font = readFileSync(join(root, "public", "fonts", "GeistMono-Variable.woff2")).toString(
  "base64",
);
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face { font-family: "Geist Mono"; src: url(data:font/woff2;base64,${font}) format("woff2"); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; }
body { width: ${WIDTH}px; height: ${HEIGHT}px; background: #16161b; color: #d8dbde; font: 400 18px/1.5 "Geist Mono", monospace; padding: 40px 56px; }
section + section { margin-top: 24px; padding-top: 24px; border-top: 1px solid #34343c; }
header { display: flex; align-items: center; gap: 14px; color: #9a9ea5; font-size: 17px; margin-bottom: 12px; }
.mark { width: 22px; height: 3px; background: #9a9ea5; transform: skewY(-26.17deg); transform-origin: 0 100%; }
.stack { margin-left: auto; }
pre { font: inherit; white-space: pre; }
.n { display: inline-block; width: 3.5ch; margin-right: 2ch; text-align: right; color: #6b6d71; }
.k { color: #f2f3f5; font-weight: 600; }
.s { color: #9a9ea5; }
</style>${panes.map(pane).join("")}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
const to = join(root, "brand", "screenshots", "charmander-code.png");
await page.screenshot({ path: to });
await browser.close();
console.log(`brand/screenshots/charmander-code.png — ${WIDTH}×${HEIGHT}`);
