import geometryJson from "../../brand/logo/geometry.json?raw";
import markSvg from "../../brand/logo/mark-transparent.svg?raw";
import { ribbonArms, ribbonBand, ribbonLowerStart, ribbonTopBar } from "./ribbon";
import { compactPath } from "./svg-path";

export const markPathId = "silver-mark-path";

// The exported SVG inlines the same 261 KB JPEG four times; pointing the tiles at the copy in
// public/ keeps the inline markup at ~31 KB instead of ~1 MB per mark.
const source = markSvg.replaceAll(/data:image\/jpeg;base64,[^"]+/g, "/brand/foil-texture.jpg");

const capture = (pattern: RegExp, label: string): string => {
  const found = pattern.exec(source)?.[1];
  if (!found) throw new Error(`brand/logo/mark-transparent.svg: no ${label}`);
  return found;
};

export const markViewBox = compactPath(capture(/viewBox="([^"]+)"/, "viewBox"));
export const markPathData = compactPath(capture(/\sd="([^"]+)"/, "path"));

const pattern = capture(/(<pattern[\s\S]*?<\/pattern>)/, "foil pattern");

export const markPattern = (uid: string): string =>
  pattern.replaceAll('id="foil"', `id="foil-${uid}"`);

const geometry = JSON.parse(geometryJson) as {
  angleDeg: number;
  ribbon: { direction: number[]; axis: number[]; start: number; width: number; offset: number };
};

const [vbX, vbY, vbSize] = markViewBox.split(" ").map(Number) as [number, number, number];
const centre = [vbX + vbSize / 2, vbY + vbSize / 2];

export const markRibbonPath = compactPath(ribbonArms(geometry.ribbon, centre));
export const markBandPath = compactPath(ribbonBand(geometry.ribbon));
export const markTopBarPath = compactPath(ribbonTopBar(geometry.ribbon, centre));
/** The part of the mark box above the lower arm's full-width point: the top bar keeps only this of the mark. */
export const markTopBarKeep = ((): { x: number; y: number; width: number; height: number } => {
  const y = ribbonLowerStart(geometry.ribbon, centre)[1]!;
  return { x: vbX, y: vbY, width: vbSize, height: Math.round((y - vbY) * 10) / 10 };
})();
