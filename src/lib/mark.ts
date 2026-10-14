import geometryJson from "../../brand/logo/geometry.json?raw";
import markSvg from "../../brand/logo/mark-transparent.svg?raw";
import { withBase } from "./base";
import {
  ribbonArms,
  ribbonBand,
  ribbonGrowth,
  ribbonSlab,
  ribbonTopBar,
  ribbonTopBarKeep,
} from "./ribbon";
import { compactPath } from "./svg-path";

export const markPathId = "silver-mark-path";

// The exported SVG inlines the same JPEG four times; pointing the tiles at public/'s copy keeps each
// inline mark at ~31 KB instead of ~1 MB.
const source = markSvg.replaceAll(
  /data:image\/jpeg;base64,[^"]+/g,
  withBase("brand/foil-texture.jpg"),
);

const capture = (pattern: RegExp, label: string): string => {
  const found = pattern.exec(source)?.[1];
  if (!found) throw new Error(`brand/logo/mark-transparent.svg: no ${label}`);
  return found;
};

export const markViewBox = compactPath(capture(/viewBox="([^"]+)"/, "viewBox"));
export const markPathData = compactPath(capture(/\sd="([^"]+)"/, "path"));

const pattern = capture(/(<pattern[\s\S]*?<\/pattern>)/, "foil pattern");

const geometry = JSON.parse(geometryJson) as {
  angleDeg: number;
  ribbon: { direction: number[]; axis: number[]; start: number; width: number; offset: number };
};

const [vbX, vbY, vbSize] = markViewBox.split(" ").map(Number) as [number, number, number];
const centre = [vbX + vbSize / 2, vbY + vbSize / 2];

/** `scale` enlarges the texture about the mark's centre, for a mark drawn much smaller than the hero's. */
export const markPattern = (uid: string, scale = 1): string =>
  pattern.replace(
    'id="foil"',
    scale === 1
      ? `id="foil-${uid}"`
      : `id="foil-${uid}" patternTransform="translate(${centre.join(" ")}) scale(${scale}) translate(${centre.map((c) => -c).join(" ")})"`,
  );

/** The band's direction in the mark's user space, as the ribbon runs: up and to the right. */
export const markAxis = geometry.ribbon.direction;

const patternTag = capture(/(<pattern[^>]*>)/, "foil pattern");
const patternTile = capture(/<pattern[^>]*>([\s\S]*?)<\/pattern>/, "foil pattern tile");
const patternNumber = (name: string): number => {
  const value = Number(new RegExp(`\\s${name}="([^"]+)"`).exec(patternTag)?.[1]);
  if (!Number.isFinite(value))
    throw new Error(`brand/logo/mark-transparent.svg: foil pattern ${name}`);
  return value;
};
/**
 * Mark units from the axis through the centre: the drawing reaches ~200 (the word), and foil.ts
 * moves the texture up to ~450 (the pointer's range plus the glint).
 */
const FOIL_REACH = 700;
/**
 * Along the axis either way. The opener's far corner lies ~3900 along it on a 3840 px screen and
 * grows with the width; this covers about 5000 px.
 */
const FOIL_RUN = 5500;
/**
 * Two antialiased edges meeting on one line let the background through as a hairline. Each cell
 * reaches this far into the next, which paints over it; the exported tile overlaps its own mirrored
 * copies by the same amount.
 */
const FOIL_OVERLAP = 1.5;

/**
 * The foil as copies of the pattern's tile laid side by side, for a group clipped to the drawing.
 * Chromium rasterizes a pattern fill's tile again for every raster tile it touches, ~70 ms each
 * without a GPU, which held the home page's first frames for over a second; plain images reuse one
 * decode. Only the cells within FOIL_REACH of the band's axis are laid.
 */
export const markFoilTiles = (uid: string): string => {
  const [x0, y0, w, h] = ["x", "y", "width", "height"].map(patternNumber) as [
    number,
    number,
    number,
    number,
  ];
  const [ax, ay] = markAxis as [number, number];
  const [cx, cy] = centre as [number, number];
  // How far a cell's corners reach from its centre across the axis, and along it.
  const across = (w * Math.abs(ay) + h * Math.abs(ax)) / 2;
  const along = (w * Math.abs(ax) + h * Math.abs(ay)) / 2;
  const span = FOIL_RUN + Math.hypot(w, h) / 2;
  const cells: string[] = [];
  for (let i = Math.floor((cx - span - x0) / w); x0 + i * w <= cx + span; i += 1) {
    for (let j = Math.floor((cy - span - y0) / h); y0 + j * h <= cy + span; j += 1) {
      const x = x0 + i * w;
      const y = y0 + j * h;
      const dx = x + w / 2 - cx;
      const dy = y + h / 2 - cy;
      if (Math.abs(dx * ay - dy * ax) > FOIL_REACH + across) continue;
      if (Math.abs(dx * ax + dy * ay) > FOIL_RUN + along) continue;
      cells.push(`<use href="#foil-tile-${uid}" x="${x}" y="${y}"/>`);
    }
  }
  const stretch = `scale(${(w + FOIL_OVERLAP) / w} ${(h + FOIL_OVERLAP) / h})`;
  return `<defs><g id="foil-tile-${uid}" transform="${stretch}">${patternTile}</g></defs><g class="foil-tiles">${cells.join("")}</g>`;
};
export const markRibbonPath = compactPath(ribbonArms(geometry.ribbon, centre));
export const markBandPath = compactPath(ribbonBand(geometry.ribbon));
export const markTopBarPath = compactPath(ribbonTopBar(geometry.ribbon, centre));
export const markTopBarKeep = ribbonTopBarKeep(geometry.ribbon, centre);
export const markSlab = ribbonSlab(geometry.ribbon, centre);
export const markArmsGrowth = ribbonGrowth(geometry.ribbon, centre, false);
export const markTopBarGrowth = ribbonGrowth(geometry.ribbon, centre, true);
