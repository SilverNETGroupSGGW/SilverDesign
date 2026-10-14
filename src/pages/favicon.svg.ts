import type { APIRoute } from "astro";
import template from "../../brand/logo/favicon.svg?raw";
import lockup from "../../brand/logo/lockup.json";
import mark from "../../brand/logo/mark.svg?raw";
import { compactPath, simplifyPolyline } from "../lib/svg-path";

const outline = /\sd="([^"]+)"/.exec(mark)?.[1];
if (!outline) throw new Error("brand/logo/mark.svg: no path");

// The mark's own frame leaves the S half the icon, too small to read in a tab. A square around the
// S with an eighth of its size clear on each side still shows the arms, cut off in the corners.
const [x, y, w, h] = lockup.bodyBox as [number, number, number, number];
const side = Math.max(w, h) * 1.25;
const viewBox = [x + w / 2 - side / 2, y + h / 2 - side / 2, side, side].join(" ");

const svg = template
  .replaceAll(/<!--[\s\S]*?-->\s*/g, "")
  .replace("{viewBox}", compactPath(viewBox))
  // A quarter of a unit is 0.04 px at the 64 px an icon reaches.
  .replace("{path}", compactPath(simplifyPolyline(outline, 0.25)));

export const GET: APIRoute = () =>
  new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
