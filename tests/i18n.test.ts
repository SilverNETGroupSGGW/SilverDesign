import { describe, expect, test } from "bun:test";
import { BASE } from "../src/lib/base";
import { fill, locales, otherLocale, pathFor } from "../src/lib/i18n";

describe("pathFor", () => {
  test("home is the locale root", () => {
    expect(pathFor("home", "pl")).toBe(`${BASE}pl/`);
    expect(pathFor("home", "en")).toBe(`${BASE}en/`);
  });
  test("slugs are localized", () => {
    expect(pathFor("projects", "pl")).toBe(`${BASE}pl/projekty/`);
    expect(pathFor("projects", "en")).toBe(`${BASE}en/projects/`);
    expect(pathFor("history", "pl")).toBe(`${BASE}pl/historia/`);
    expect(pathFor("brochureCompanies", "en")).toBe(`${BASE}en/brochure/companies/`);
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
        expect(pathFor(key, locale)).toMatch(new RegExp(`^${BASE}${locale}/(.*/)?$`));
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
