export const locales = ["pl", "en"] as const;
export type Locale = (typeof locales)[number];

const routes = {
  home: { pl: "", en: "" },
  projects: { pl: "projekty", en: "projects" },
  history: { pl: "historia", en: "history" },
  brochureStudents: { pl: "broszura/studenci", en: "brochure/students" },
  brochureCompanies: { pl: "broszura/firmy", en: "brochure/companies" },
} as const;
export type RouteKey = keyof typeof routes;

export const pathFor = (key: RouteKey, locale: Locale): string => {
  const slug = routes[key][locale];
  return slug === "" ? `/${locale}/` : `/${locale}/${slug}/`;
};

export const otherLocale = (locale: Locale): Locale => (locale === "pl" ? "en" : "pl");

export const fill = (template: string, vars: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
