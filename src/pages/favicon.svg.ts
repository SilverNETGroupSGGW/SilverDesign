import type { APIRoute } from "astro";
import template from "../../brand/logo/favicon.svg?raw";
import mark from "../../brand/logo/mark.svg?raw";
import { compactPath } from "../lib/svg-path";

const viewBox = /viewBox="([^"]+)"/.exec(mark)?.[1];
const outline = /\sd="([^"]+)"/.exec(mark)?.[1];
if (!viewBox || !outline) throw new Error("brand/logo/mark.svg: no viewBox or path");

const svg = template
  .replaceAll(/<!--[\s\S]*?-->\s*/g, "")
  .replace("{viewBox}", compactPath(viewBox))
  .replace("{path}", compactPath(outline));

export const GET: APIRoute = () =>
  new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
