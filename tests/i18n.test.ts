import { describe, expect, test } from "bun:test";
import { fill, locales, otherLocale, pathFor } from "../src/lib/i18n";

describe("pathFor", () => {
  test("home is the locale root", () => {
    expect(pathFor("home", "pl")).toBe("/pl/");
    expect(pathFor("home", "en")).toBe("/en/");
  });
  test("slugs are localized", () => {
    expect(pathFor("projects", "pl")).toBe("/pl/projekty/");
    expect(pathFor("projects", "en")).toBe("/en/projects/");
    expect(pathFor("history", "pl")).toBe("/pl/historia/");
    expect(pathFor("brochureCompanies", "en")).toBe("/en/brochure/companies/");
  });
  test("every route exists for every locale", () => {
    for (const locale of locales) {
      for (const key of [
        "home",
        "projects",
        "history",
        "brochureStudents",
        "brochureCompanies",
      ] as const) {
        expect(pathFor(key, locale)).toMatch(new RegExp(`^/${locale}/.*/$|^/${locale}/$`));
      }
    }
  });
});

test("otherLocale flips", () => {
  expect(otherLocale("pl")).toBe("en");
  expect(otherLocale("en")).toBe("pl");
});

test("fill replaces placeholders", () => {
  expect(fill("Przy WZIM SGGW od {year}", { year: 2013 })).toBe("Przy WZIM SGGW od 2013");
});
