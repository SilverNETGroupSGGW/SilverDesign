import markSvg from "../../brand/logo/mark-transparent.svg?raw";
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
