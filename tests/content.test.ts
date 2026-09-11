import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CopySchema,
  HistorySchema,
  historyStart,
  ProjectSchema,
  SiteSchema,
} from "../src/lib/schemas";

const root = join(import.meta.dir, "..", "src", "content");
const readJson = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const listJson = (dir: string) =>
  readdirSync(join(root, dir))
    .filter((f) => f.endsWith(".json"))
    .map((f) => [f, readJson(join(root, dir, f))] as const);

describe("site.json", () => {
  test("has every fact the pages need", () => {
    const site = SiteSchema.parse(readJson(join(root, "site.json")));
    expect(site.since).toBe(2013);
    expect(site.discord).toMatch(/^https:\/\/discord\.gg\//);
    expect(site.email).toContain("@");
  });
});

describe("projects", () => {
  test("all four project files are present", () => {
    expect(listJson("projects").length).toBe(4);
  });
  test("every file matches the schema", () => {
    for (const [file, data] of listJson("projects")) {
      expect(() => ProjectSchema.parse(data), file).not.toThrow();
    }
  });
  test("store projects link to at least one store", () => {
    for (const [file, data] of listJson("projects")) {
      const p = ProjectSchema.parse(data);
      if (p.status === "store") {
        expect(Boolean(p.links.play || p.links.appStore), file).toBe(true);
      }
    }
  });
});

describe("history", () => {
  test("all eleven history entries are present", () => {
    expect(listJson("history").length).toBe(11);
  });
  test("every entry has a year between 2013 and now", () => {
    const now = new Date().getFullYear();
    for (const [file, data] of listJson("history")) {
      const h = HistorySchema.parse(data);
      const start = historyStart(h);
      expect(start, file).toBeGreaterThanOrEqual(2013);
      expect(start, file).toBeLessThanOrEqual(now);
    }
  });
  test("no entry links anywhere", () => {
    for (const [file, data] of listJson("history")) {
      expect(JSON.stringify(data), file).not.toMatch(/https?:\/\//);
    }
  });
});

describe("copy", () => {
  test("pl and en both satisfy the same schema", () => {
    for (const locale of ["pl", "en"]) {
      const data = readJson(join(root, "copy", `${locale}.json`));
      expect(() => CopySchema.parse(data), locale).not.toThrow();
    }
  });
  test("no forbidden words on the home page copy", () => {
    const forbidden = /misj|pasj|dynamiczn|innowacyjn|reaktywac|mission|passion|innovativ/i;
    for (const locale of ["pl", "en"]) {
      const { history: _history, ...rest } = CopySchema.parse(
        readJson(join(root, "copy", `${locale}.json`)),
      );
      expect(JSON.stringify(rest), locale).not.toMatch(forbidden);
    }
  });
});
