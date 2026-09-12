import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import opentype from "opentype.js";
import { chromium } from "playwright";
import { ribbonArms } from "../src/lib/ribbon";
import { compactPath } from "../src/lib/svg-path";

const FAMILY = "Syncopate";
/**
 * The cuts the "heaviest stem that still fits" rule is evaluated over. Regular is an input to the
 * rule, not a shipped asset: while it is the only cut that fits, the synthetic stroke that brings
 * it up to the S's weight pushes the letters below the S's bottom line, which is what drives the
 * cap height down to the ratio at which Bold fits and the rule settles.
 */
const CUTS = [
  { weight: 400, file: "Syncopate-Regular.ttf" },
  { weight: 700, file: "Syncopate-Bold.ttf" },
];
const TEXT = "ilver";
/** The S body's box in mark user units, measured from the last subpath of the mark path. */
const BODY = { l: 448.4, r: 751.6, t: 438.6, b: 761.4 };
// Monoline thickness of the S (horizontal run through the left bow at y = 560 is 52.5 u).
const S_STROKE = 50;
const CAP_RATIO = 0.66;
const RASTER = 200;
const PLAQUE = [900, 460] as const;
const BG = "#16161B";

interface Geometry {
  angleDeg: number;
  ribbon: { direction: number[]; axis: number[]; start: number; width: number; offset: number };
}

interface Input {
  dir: [number, number];
  axis: [number, number];
  start: number;
  armWidth: number;
  body: typeof BODY;
  stroke: number;
  capRatio: number;
  weights: number[];
  family: string;
  text: string;
  raster: number;
  upem: number;
  ratio: number;
}

interface Layout {
  capRatio: number;
  weight: number;
  fs: number;
  stemU: number;
  strokeU: number;
  gapU: number;
  sGap: [number, number];
  origin: [number, number];
  angleDeg: number;
  advEm: number[];
  penEm: number[];
  frame: [number, number, number, number];
}

const root = resolve(import.meta.dir, "..");
const out = join(root, "brand", "logo");
mkdirSync(out, { recursive: true });

const markSvg = await Bun.file(join(out, "mark-transparent.svg")).text();
const geometry = JSON.parse(await Bun.file(join(out, "geometry.json")).text()) as Geometry;

const capture = (pattern: RegExp, label: string): string => {
  const found = pattern.exec(markSvg)?.[1];
  if (!found) throw new Error(`brand/logo/mark-transparent.svg: no ${label}`);
  return found;
};
const viewBox = capture(/viewBox="([^"]+)"/, "viewBox")
  .split(/\s+/)
  .map(Number);
const markPath = capture(/\sd="([^"]+)"/, "mark path");
const texture = capture(/href="(data:image\/jpeg;base64,[^"]+)"/, "foil texture");
const pattern = capture(/(<pattern[\s\S]*?<\/pattern>)/, "foil pattern");
// The gap measurement needs the S alone: the same path carries the band, which reaches thousands of
// units past the frame and would answer "how far to the S" with a hit on the arm the word hangs from.
const sBody = `M${markPath.split("M").at(-1)!}`;

const [vbX, vbY, vbSize] = viewBox as [number, number, number];
const centre: [number, number] = [vbX + vbSize / 2, vbY + vbSize / 2];

const cuts = await Promise.all(
  CUTS.map(async (cut) => {
    const bytes = await Bun.file(join(root, "brand", "fonts", cut.file)).bytes();
    return {
      weight: cut.weight,
      file: cut.file,
      bytes,
      font: opentype.parse(Buffer.from(bytes).buffer as ArrayBuffer),
    };
  }),
);
const upem = cuts[0]!.font.unitsPerEm;
if (cuts.some((cut) => cut.font.unitsPerEm !== upem)) {
  throw new Error("the Syncopate cuts disagree on unitsPerEm; the advance check needs one em size");
}

const browser = await chromium.launch();
const layout = await (async (): Promise<Layout> => {
  const page = await browser.newPage();
  // A page built with setContent has an opaque origin, so a file:// @font-face URL is refused; the
  // measurements would then silently describe the platform sans instead of Syncopate.
  await page.setContent(`<!doctype html>
<style>${cuts
    .map(
      (cut) => `
  @font-face {
    font-family: "${FAMILY}";
    src: url("data:font/ttf;base64,${Buffer.from(cut.bytes).toString("base64")}") format("truetype");
    font-weight: ${cut.weight};
  }`,
    )
    .join("")}
</style>
<svg width="0" height="0" aria-hidden="true" style="position:absolute">
  <path id="sbody" d="${sBody}"/>
</svg>`);
  await page.evaluate(
    async (weights: number[]) => {
      await Promise.all(weights.map((w) => document.fonts.load(`${w} 100px "Syncopate"`)));
      await document.fonts.ready;
    },
    cuts.map((cut) => cut.weight),
  );

  const fitInput: Input = {
    dir: [geometry.ribbon.direction[0]!, geometry.ribbon.direction[1]!],
    axis: [geometry.ribbon.axis[0]!, geometry.ribbon.axis[1]!],
    start: geometry.ribbon.start,
    armWidth: geometry.ribbon.width,
    body: BODY,
    stroke: S_STROKE,
    capRatio: CAP_RATIO,
    weights: cuts.map((cut) => cut.weight),
    family: FAMILY,
    text: TEXT,
    raster: RASTER,
    upem,
    ratio: PLAQUE[0] / PLAQUE[1],
  };
  return page.evaluate((input: Input): Layout => {
    const { dir, axis, start, armWidth: W, body, stroke, text, family, raster: R } = input;
    const n: [number, number] = [-dir[1], dir[0]];
    const BODY_H = body.b - body.t;
    const deg = -((Math.atan2(dir[1], dir[0]) * 180) / Math.PI);
    const rad = (-deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rot =
      (qx: number, qy: number) =>
      (x: number, y: number): [number, number] => [qx + x * cos - y * sin, qy + x * sin + y * cos];
    const toMark = (t: number, u: number): [number, number] => [
      axis[0] + dir[0] * t + n[0] * u,
      axis[1] + dir[1] * t + n[1] * u,
    ];
    const sBodyPath = document.querySelector<SVGPathElement>("#sbody")!;
    // Everything the fit measures hangs off this box: the cap height, the bottom rule and the frame
    // all quote it as a constant, so a re-exported mark that moved would place the word against a
    // box that no longer exists — silently, since the expectations would move with it.
    const drawn = sBodyPath.getBBox();
    const measured = {
      l: drawn.x,
      r: drawn.x + drawn.width,
      t: drawn.y,
      b: drawn.y + drawn.height,
    };
    for (const side of ["l", "r", "t", "b"] as const) {
      if (Math.abs(measured[side] - body[side]) > 0.1) {
        throw new Error(
          `the S body is at ${measured.l.toFixed(1)}-${measured.r.toFixed(1)} x ` +
            `${measured.t.toFixed(1)}-${measured.b.toFixed(1)}, not ${body.l}-${body.r} x ` +
            `${body.t}-${body.b}: re-measure the fit's constants against the new mark`,
        );
      }
    }

    // <text>.getBBox() is font-metric based (ascent + descent); canvas measureText gives the ink box.
    const cv = document.createElement("canvas").getContext("2d")!;
    const ink = (weight: number) => {
      cv.font = `${weight} 100px "${family}"`;
      cv.letterSpacing = "0px";
      cv.fontKerning = "none";
      const bar = cv.measureText(text[0]!);
      const m = cv.measureText(text);
      return {
        asc: m.actualBoundingBoxAscent / 100,
        desc: m.actualBoundingBoxDescent / 100,
        left: m.actualBoundingBoxLeft / 100,
        right: m.actualBoundingBoxRight / 100,
        stemEm: (bar.actualBoundingBoxLeft + bar.actualBoundingBoxRight) / 100,
        firstDesc: bar.actualBoundingBoxDescent / 100,
      };
    };

    // Silhouette of one glyph at `R` px (with `strokeEm` of stroke): per-row leftmost/rightmost ink
    // in em, from the glyph origin. Optical spacing works on these rows, not on bounding boxes.
    const sil = (weight: number, ch: string, strokeEm: number) => {
      const canvas = document.createElement("canvas");
      canvas.width = 4 * R;
      canvas.height = 2 * R;
      const g = canvas.getContext("2d")!;
      g.font = `${weight} ${R}px "${family}"`;
      g.fontKerning = "none";
      g.fillStyle = "#fff";
      g.strokeStyle = "#fff";
      g.lineJoin = "miter";
      g.miterLimit = 2;
      g.setTransform(1, 0, 0, 1, R, 1.5 * R);
      g.fillText(ch, 0, 0);
      if (strokeEm > 0) {
        g.lineWidth = strokeEm * R;
        g.strokeText(ch, 0, 0);
      }
      const d = g.getImageData(0, 0, canvas.width, canvas.height).data;
      const rows: ([number, number] | null)[] = [];
      for (let y = 0; y < canvas.height; y++) {
        let l = -1;
        let r = -1;
        for (let x = 0; x < canvas.width; x++) {
          if (d[(y * canvas.width + x) * 4 + 3]! > 0) {
            if (l < 0) l = x;
            r = x;
          }
        }
        rows.push(l < 0 ? null : [(l - R) / R, (r + 1 - R) / R]);
      }
      // Chromium rounds glyph advances to whole pixels, so the advance is measured at the font's
      // em size, where one pixel is one font unit and the rounding is below a thousandth of an em.
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.font = `${weight} ${input.upem}px "${family}"`;
      return { rows, adv: g.measureText(ch).width / input.upem };
    };
    type Silhouette = ReturnType<typeof sil>;

    // dx (em) placing glyph b after a so the mean row gap is `gap` em and no row gap is below `floor`.
    // Hoisting it out of the fit would put it out of reach: only this function is serialised.
    // oxlint-disable-next-line unicorn/consistent-function-scoping -- runs in page.evaluate
    const optical = (a: Silhouette, b: Silhouette, gap: number, floor: number): number => {
      const ds: number[] = [];
      for (let y = 0; y < a.rows.length; y++) {
        const ra = a.rows[y];
        const rb = b.rows[y];
        if (ra && rb) ds.push(a.adv + rb[0] - ra[1]);
      }
      if (ds.length === 0) return 0;
      const mean = ds.reduce((x, y) => x + y, 0) / ds.length;
      return Math.max(gap - mean, floor - Math.min(...ds));
    };

    // Letters: the tallest cap height (<= the starting ratio of the S body) at which the first letter
    // still ends on the inner edge of the S's bottom stroke. Stem = the S's stroke, the heaviest cut
    // that fits under it. The first letter's left ink edge sits on the S's end: the perpendicular
    // through the notch (t = start). One gap for everything, taken from S -> first letter: the word
    // hangs `gap` under the arm, which moves the letter across the S's bow, so the gap is a fixed
    // point.
    const place = (capRatio: number) => {
      const cap = capRatio * BODY_H;
      let weight = input.weights[0]!;
      let k = ink(weight);
      // A stroke adds only the remainder, so the counters keep their drawn shape (a 400 cut stroked
      // to 50 u clogged the "e").
      for (const w of input.weights) {
        const kw = ink(w);
        if ((kw.stemEm * cap) / kw.asc <= stroke + 0.5) {
          weight = w;
          k = kw;
        }
      }
      let fs = cap / k.asc;
      let strokeU = Math.max(0, stroke - k.stemEm * fs);
      fs = (cap - strokeU / 2) / k.asc;
      strokeU = Math.max(0, stroke - k.stemEm * fs);
      const h = strokeU / 2;
      const sils = [...text].map((ch) => sil(weight, ch, strokeU / fs));
      const s0 = sils[0]!;
      const leftEm = Math.min(
        ...s0.rows.filter((r): r is [number, number] => r !== null).map((r) => r[0]),
      );
      const t0 = start - leftEm * fs;
      const sDist = (off: number): number[] => {
        const ds: number[] = [];
        for (let y = 0; y < s0.rows.length; y += 4) {
          const r = s0.rows[y];
          if (!r) continue;
          const v = off + ((y - 1.5 * R) / R) * fs;
          const tl = t0 + r[0] * fs;
          for (let q = 0; q < 3 * W; q += 1) {
            const [x, y2] = toMark(tl - q, v);
            if (sBodyPath.isPointInFill(new DOMPoint(x, y2))) {
              ds.push(q);
              break;
            }
          }
        }
        return ds;
      };
      let gapU = stroke / 2;
      let off = W / 2 + gapU + cap;
      let ds: number[] = [];
      for (let i = 0; i < 8; i++) {
        off = W / 2 + gapU + cap;
        ds = sDist(off);
        if (ds.length === 0) {
          throw new Error(
            `no row of the first letter reaches the S from ${(3 * W).toFixed(0)} u away at cap ` +
              `ratio ${capRatio.toFixed(2)}: the word is not beside the S`,
          );
        }
        const g = Math.min(...ds);
        if (Math.abs(g - gapU) < 0.5) break;
        gapU = g;
      }
      const q = toMark(t0, off);
      // The first letter ends on the inner edge of the S's bottom stroke: the letter sits beside the
      // S, and a flat bottom level with the bow's lowest point reads as hanging below it.
      const bottom = rot(q[0], q[1])(leftEm * fs - h, k.firstDesc * fs + h)[1];
      return {
        cap,
        capRatio,
        weight,
        k,
        fs,
        strokeU,
        h,
        sils,
        gapU,
        ds,
        q,
        bottom,
        excess: bottom - (body.b - stroke),
      };
    };

    let capRatio = input.capRatio;
    let best = place(capRatio);
    while (best.excess > 0.5 && capRatio > 0.4) {
      capRatio -= 0.01;
      best = place(capRatio);
    }
    const { k, fs, strokeU, h, sils, gapU, ds, q } = best;

    // Per-pair optical spacing: mean row gap `gapU` after the stroke, no row closer than 0.6 gapU.
    const penEm = [0];
    let extraU = 0;
    for (let i = 0; i + 1 < text.length; i++) {
      const dx = optical(sils[i]!, sils[i + 1]!, gapU / fs, (0.6 * gapU) / fs);
      extraU += dx * fs;
      penEm.push(penEm[i]! + sils[i]!.adv + dx);
    }

    const right = k.right + extraU / fs;
    const corner = rot(q[0], q[1]);
    const box = [
      corner(-k.left * fs - h, -k.asc * fs - h),
      corner(right * fs + h, -k.asc * fs - h),
      corner(-k.left * fs - h, k.desc * fs + h),
      corner(right * fs + h, k.desc * fs + h),
    ];
    const xs = [...box.map((p) => p[0]), body.l, body.r];
    const ys = [...box.map((p) => p[1]), body.t, body.b];
    const pad = 0.45 * BODY_H;
    let x0 = Math.min(...xs) - pad;
    let y0 = Math.min(...ys) - pad;
    let w = Math.max(...xs) + pad - x0;
    let hh = Math.max(...ys) + pad - y0;
    if (w / hh < input.ratio) {
      const grown = hh * input.ratio;
      x0 -= (grown - w) / 2;
      w = grown;
    } else {
      const grown = w / input.ratio;
      y0 -= (grown - hh) / 2;
      hh = grown;
    }

    return {
      capRatio,
      weight: best.weight,
      fs,
      stemU: k.stemEm * fs,
      strokeU,
      gapU,
      sGap: [ds.reduce((x, y) => x + y, 0) / ds.length, Math.min(...ds)],
      origin: q,
      angleDeg: -deg,
      advEm: sils.map((s) => s.adv),
      penEm,
      frame: [x0, y0, w, hh],
    };
  }, fitInput);
})();

// 0.3 u of missing stem on a 50 u stroke is under a tenth of a printed millimetre; anything the eye
// could catch has to be answered by a heavier cut, not by quietly outlining the letters.
if (layout.strokeU >= 1) {
  throw new Error(
    `Syncopate ${layout.weight} leaves ${layout.strokeU.toFixed(1)} u of the S's ${S_STROKE} u ` +
      `stroke unfilled; the lockup needs a heavier cut, not an outline`,
  );
}

const cut = cuts.find((c) => c.weight === layout.weight)!;
const rad = (layout.angleDeg * Math.PI) / 180;
const cos = Math.cos(rad);
const sin = Math.sin(rad);
const [ox, oy] = layout.origin;
const at = (x: number, y: number): string =>
  `${(ox + x * cos - y * sin).toFixed(4)} ${(oy + x * sin + y * cos).toFixed(4)}`;

let word = "";
for (const [i, ch] of [...TEXT].entries()) {
  const glyph = cut.font.charToGlyph(ch);
  const advEm = glyph.advanceWidth! / upem;
  if (Math.abs(advEm - layout.advEm[i]!) > 0.002) {
    throw new Error(
      `${ch}: opentype advance ${advEm.toFixed(4)} em vs browser ${layout.advEm[i]!.toFixed(4)} em`,
    );
  }
  for (const cmd of glyph.getPath(layout.penEm[i]! * layout.fs, 0, layout.fs).commands) {
    switch (cmd.type) {
      case "M":
      case "L":
        word += ` ${cmd.type} ${at(cmd.x, cmd.y)}`;
        break;
      case "Q":
        word += ` Q ${at(cmd.x1, cmd.y1)} ${at(cmd.x, cmd.y)}`;
        break;
      case "C":
        word += ` C ${at(cmd.x1, cmd.y1)} ${at(cmd.x2, cmd.y2)} ${at(cmd.x, cmd.y)}`;
        break;
      case "Z":
        word += " Z";
        break;
    }
  }
}
const wordPath = compactPath(word);

const round = (n: number): number => Math.round(n * 10) / 10;
const frame = layout.frame.map(round) as [number, number, number, number];

// The page lays the word and the S body out against the ribbon's edges, so the boxes it measures
// them by are exported next to the path instead of being retyped wherever a layout needs them.
// `wordBox` is axis-aligned; the word is not, so the box's corners reach well past the letters
// across the arm. `wordSpan` is the outline itself projected on the arm's axis (along) and on its
// normal (across, positive below the centreline), which is what a layout hugging the word needs.
const { wordBox, wordSpan } = await (async (): Promise<{
  wordBox: [number, number, number, number];
  wordSpan: { along: [number, number]; across: [number, number] };
}> => {
  const page = await browser.newPage();
  await page.setContent(
    `<!doctype html><svg width="0" height="0" style="position:absolute"><path id="word" d="${wordPath}"/></svg>`,
  );
  const measured = await page.evaluate(
    ({ axis, dir }) => {
      const path = document.querySelector<SVGPathElement>("#word")!;
      const { x, y, width, height } = path.getBBox();
      const across = [-dir[1]!, dir[0]!];
      const total = path.getTotalLength();
      let along: [number, number] = [Infinity, -Infinity];
      let over: [number, number] = [Infinity, -Infinity];
      for (let i = 0; i <= 4000; i++) {
        const p = path.getPointAtLength((total * i) / 4000);
        const t = (p.x - axis[0]!) * dir[0]! + (p.y - axis[1]!) * dir[1]!;
        const u = (p.x - axis[0]!) * across[0]! + (p.y - axis[1]!) * across[1]!;
        along = [Math.min(along[0], t), Math.max(along[1], t)];
        over = [Math.min(over[0], u), Math.max(over[1], u)];
      }
      return {
        box: [x, y, width, height] as [number, number, number, number],
        along,
        across: over,
      };
    },
    { axis: geometry.ribbon.axis, dir: geometry.ribbon.direction },
  );
  await page.close();
  return {
    wordBox: measured.box.map(round) as [number, number, number, number],
    wordSpan: {
      along: measured.along.map(round) as [number, number],
      across: measured.across.map(round) as [number, number],
    },
  };
})();
const lockup = {
  font: { family: FAMILY, weight: layout.weight, file: `brand/fonts/${cut.file}` },
  capRatio: Math.round(layout.capRatio * 100) / 100,
  gapU: round(layout.gapU),
  stemU: round(layout.stemU),
  strokeU: round(layout.strokeU),
  word: {
    text: TEXT,
    fontSizeU: round(layout.fs),
    angleDeg: Math.round(layout.angleDeg * 100) / 100,
    origin: layout.origin.map(round),
    glyphs: [...TEXT].map((ch, i) => ({ ch, penEm: Math.round(layout.penEm[i]! * 10000) / 10000 })),
  },
  path: wordPath,
  wordBox,
  wordSpan,
  frame,
  markViewBox: viewBox,
  bodyBox: [BODY.l, BODY.t, BODY.r - BODY.l, BODY.b - BODY.t].map(round),
};
writeFileSync(join(out, "lockup.json"), JSON.stringify(lockup, null, 2) + "\n");

const box = frame.join(" ");
// The mark master inlines the same 261 KB JPEG once per tile; one <symbol> behind four <use>es is
// the same foil at a quarter of the bytes, and taking the tiles from the master instead of retyping
// them keeps the lockup's texture identical to the page's if the configurator ever changes it.
const tiles = pattern.replaceAll(/<image href="data:[^"]*"/g, '<use href="#foilTex"');
if (!tiles.includes("#foilTex") || tiles.includes("data:")) {
  throw new Error("brand/logo/mark-transparent.svg: the foil pattern is not four inline images");
}
const standalone = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" width="${PLAQUE[0]}" height="${PLAQUE[1]}" role="img" aria-label="Silver">
  <defs>
    <symbol id="foilTex" viewBox="0 0 1 1" preserveAspectRatio="none">
      <image href="${texture}" x="0" y="0" width="1" height="1" preserveAspectRatio="none"/>
    </symbol>
    ${tiles}
  </defs>
  <rect x="${frame[0]}" y="${frame[1]}" width="${frame[2]}" height="${frame[3]}" fill="${BG}"/>
  <path d="${compactPath(ribbonArms(geometry.ribbon, centre))}" fill="url(#foil)"/>
  <path d="${compactPath(markPath)}" fill="url(#foil)"/>
  <path d="${wordPath}" fill="url(#foil)"/>
</svg>
`;
writeFileSync(join(out, "lockup.svg"), standalone);

const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await og.setContent(`<!doctype html>
<style>
  html, body { margin: 0; height: 100%; }
  body { background: ${BG}; display: flex; align-items: center; justify-content: center; }
</style>
${standalone}`);
await og.screenshot({ path: join(root, "public", "og.png") });
await browser.close();

console.log(
  `exported lockup.json, lockup.svg, og.png — Syncopate ${layout.weight}, cap ${lockup.capRatio} ` +
    `of the S body, gap ${lockup.gapU} u (S→"i" mean ${layout.sGap[0].toFixed(0)} u, nearest ` +
    `${layout.sGap[1].toFixed(0)} u), stem ${lockup.stemU} u + ${lockup.strokeU} u dropped, ` +
    `frame ${box}`,
);
