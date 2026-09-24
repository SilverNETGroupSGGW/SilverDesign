import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  // The Pages workflow passes the real origin and base (`astro build --site --base`); locally the
  // site is served from the root.
  site: "https://silvernetgroupsggw.github.io",
  output: "static",
  integrations: [
    sitemap({
      // The brochures are handed out and carry noindex (spec §4), and the site's root only
      // redirects to /pl/. Matching paths under a locale drops the redirect whatever base the build
      // is given; the integration drops the 404 on its own.
      filter: (page) => {
        const path = new URL(page).pathname;
        return /\/(pl|en)\//.test(path) && !/\/(broszura|brochure)\//.test(path);
      },
      // No i18n option: it pairs locales by an identical path after the prefix, and the routes are
      // localised (/pl/historia/ against /en/history/), so it would emit alternates for the two
      // home pages and none for the other four. The pages carry their own hreflang links.
    }),
  ],
  trailingSlash: "always",
  i18n: {
    defaultLocale: "pl",
    locales: ["pl", "en"],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
});
