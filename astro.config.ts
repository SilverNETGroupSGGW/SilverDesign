import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://silvernetgroupsggw.github.io",
  output: "static",
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
