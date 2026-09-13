import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://silvernetgroupsggw.github.io",
  output: "static",
  integrations: [
    sitemap({
      // The brochures are handed out and carry noindex (spec §4), the 404 is not a page of the
      // site, and / only redirects to /pl/: what is left is the six pages a reader can land on.
      filter: (page) => {
        const path = new URL(page).pathname;
        return path !== "/" && !path.startsWith("/404") && !/\/(broszura|brochure)\//.test(path);
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
