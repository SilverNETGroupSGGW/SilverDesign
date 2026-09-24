import type { APIRoute } from "astro";
import { withBase } from "../lib/base";

// Generated rather than static: the sitemap's URL carries whatever origin and base the build has.
export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *\nAllow: /\nSitemap: ${new URL(withBase("sitemap-index.xml"), site)}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
