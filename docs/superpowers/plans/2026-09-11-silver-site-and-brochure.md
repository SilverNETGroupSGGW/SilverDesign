# Silver Site and Brochures Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A static PL/EN website for the Silver .NET student club plus four A4 brochure PNGs, all rendered from one content source.

**Architecture:** Astro (static output) with prefixed locales `/pl/…` and `/en/…`; content lives in `src/content/` as JSON validated by Zod schemas that both the build and `bun test` use. Brochures are ordinary Astro routes at a fixed 1240×1754 CSS px, screenshotted by Playwright at 2× into 2480×3508 PNGs. The logo SVG is exported from the existing `logo-configurator.html` by a Playwright script, never by hand.

**Tech Stack:** Bun 1.4, Astro 7.3, TypeScript 6 (`astro/tsconfigs/strictest`), oxlint 1.82, oxfmt 0.67, mise, Playwright 1.63 (chromium), `qrcode` 1.5, Geist + Geist Mono (npm `geist`, OFL).

**Spec:** `docs/superpowers/specs/2026-09-11-silver-site-and-brochure-design.md`

## Global Constraints

- Every page lives under `/pl/…` or `/en/…`; `/` is only a redirect page (meta refresh + link) to `/pl/`.
- Copy rules (spec §2): present tense; no "reactivation"; no weekly-meeting claims; no 2014 hackathon or archive names outside `/pl/historia`; no archive links or Wayback anywhere on the site; no former members' names anywhere.
- Colours: background `#16161B`, text/accent `#D8DBDE`, derived greys only; every text colour ≥ 4.5:1 on its ground.
- Texture `brand/foil-texture.jpg` appears only inside the S mark and the hero band.
- One diagonal angle everywhere: the band angle recorded in `brand/logo/geometry.json` by the export script.
- Fonts: Geist (everything) and Geist Mono (identifiers, addresses only), self-hosted woff2 in `public/fonts/` with `LICENSE.txt` beside them.
- No UI framework; total client JS < 20 KB; one motion effect (foil follows pointer), off under `prefers-reduced-motion`; no scroll animations, no carousels.
- Brochure PNGs: exactly 2480×3508, four files, no overflow.
- Tooling: only oxlint and oxfmt for lint/format; `astro check` with zero errors; `bun test` green.
- Commit message trailer on every commit: `Claude-Session: https://claude.ai/code/session_01XnMq4CaXuK3EoJQZAGVBVk`
- Comments in code only where load-bearing (shut-up-and-code rules apply to every file).
- `logo-configurator.html`, `brand/foil-texture.jpg`, `brand/screenshots/` stay where they are.

## File Structure

```
mise.toml                         bun version + tasks
package.json / bun.lock           deps, scripts
tsconfig.json                     extends astro/tsconfigs/strictest
astro.config.ts                   site, i18n, static output
.oxlintrc.json / .oxfmtrc.json    lint/format config
.gitignore                        + node_modules, dist, .astro
.github/workflows/deploy.yml      check → test → build → Pages
public/fonts/                     Geist-Variable.woff2, GeistMono-Variable.woff2, LICENSE.txt
public/favicon.svg                simplified S mark, flat colour
brand/logo/settings.json          configurator settings (spec §11)
brand/logo/mark.svg               exported, with background
brand/logo/mark-transparent.svg   exported, transparent
brand/logo/geometry.json          { "angleDeg": … } from the export script
scripts/export-logo.ts            Playwright → brand/logo/*
scripts/render-brochures.ts       Playwright → dist/brochure/*.png
scripts/png-size.ts               read IHDR width/height
src/content.config.ts             collections: copy, projects, history, site
src/content/site.json             contact, room, links, since-year
src/content/copy/pl.json, en.json all UI/section strings
src/content/projects/*.json       4 projects
src/content/history/*.json        11 timeline entries
src/lib/schemas.ts                Zod schemas shared by content.config.ts and tests
src/lib/i18n.ts                   Locale, routes, otherLocale, pathFor
src/styles/tokens.css             colours, angle, type scale, spacing
src/styles/base.css               reset, fonts, body, focus, utilities
src/layouts/Base.astro            <html lang>, head, hreflang, header/footer slots
src/layouts/Brochure.astro        1240×1754 fixed page, noindex
src/components/Mark.astro         inline logo SVG + foil pointer script
src/components/Header.astro
src/components/Footer.astro
src/components/LocaleSwitch.astro
src/components/Button.astro
src/components/ProjectCard.astro
src/components/ProjectFilter.astro  buttons + filter script
src/components/Timeline.astro
src/components/Qr.astro           qrcode → inline SVG
src/views/Home.astro              the whole home page for one locale
src/views/Projects.astro
src/views/History.astro
src/views/BrochureStudents.astro
src/views/BrochureCompanies.astro
src/pages/index.astro             root redirect
src/pages/pl/index.astro, projekty.astro, historia.astro, broszura/studenci.astro, broszura/firmy.astro
src/pages/en/index.astro, projects.astro, history.astro, brochure/students.astro, brochure/companies.astro
tests/content.test.ts             schemas × JSON files
tests/i18n.test.ts                routes and switch
tests/png-size.test.ts            IHDR parser
```

---

### Task 1: Project scaffold and toolchain

**Files:**
- Create: `mise.toml`, `package.json`, `tsconfig.json`, `astro.config.ts`, `.oxlintrc.json`, `.oxfmtrc.json`, `src/pages/index.astro`, `src/pages/pl/index.astro`, `src/pages/en/index.astro`
- Modify: `.gitignore`
- Modify: `docs/superpowers/specs/2026-09-11-silver-site-and-brochure-design.md` (§9: Astro 7, `redirectToDefaultLocale: false` with a hand-written root page)

**Interfaces:**
- Produces: scripts `dev`, `check`, `lint`, `fmt`, `fmt:check`, `test`, `build`, `preview`; mise tasks with the same names plus `brochure` and `logo:export` (wired in later tasks).

- [ ] **Step 1: Write `mise.toml`**

```toml
[tools]
bun = "1.4.0"

[tasks.dev]
run = "bun run dev"
[tasks.check]
run = "bun run check"
[tasks.lint]
run = "bun run lint"
[tasks.fmt]
run = "bun run fmt"
[tasks.test]
run = "bun test"
[tasks.build]
run = "bun run build"
[tasks."logo:export"]
run = "bun run logo:export"
[tasks.brochure]
depends = ["build"]
run = "bun run brochure"
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "silver-site",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "check": "astro check",
    "lint": "oxlint",
    "fmt": "oxfmt",
    "fmt:check": "oxfmt --check",
    "build": "astro build",
    "preview": "astro preview",
    "logo:export": "bun scripts/export-logo.ts",
    "brochure": "bun scripts/render-brochures.ts"
  },
  "dependencies": {
    "astro": "^7.3.2",
    "qrcode": "^1.5.4"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.10",
    "@types/qrcode": "^1.5.5",
    "geist": "^1.7.2",
    "oxfmt": "^0.67.0",
    "oxlint": "^1.82.0",
    "playwright": "^1.63.0",
    "typescript": "^6.0.3"
  }
}
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strictest",
  "include": [".astro/types.d.ts", "src/**/*", "scripts/**/*", "tests/**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "types": ["bun-types"],
    "resolveJsonModule": true
  }
}
```

Add `"bun-types": "^1.4.0"` to devDependencies in `package.json`.

- [ ] **Step 4: Write `astro.config.ts`**

```ts
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
```

- [ ] **Step 5: Write lint and format config**

`.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "categories": { "correctness": "error", "suspicious": "error", "perf": "warn" },
  "ignorePatterns": ["dist", ".astro", "logo-configurator.html"]
}
```

`.oxfmtrc.json`:

```json
{
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "printWidth": 100,
  "ignorePatterns": ["dist", ".astro", "bun.lock", "logo-configurator.html", "brand"]
}
```

- [ ] **Step 6: Extend `.gitignore`**

Append:

```
node_modules/
dist/
.astro/
```

(`node_modules/` is already present; keep one line.)

- [ ] **Step 7: Write the root redirect page and locale placeholders**

`src/pages/index.astro`:

```astro
---
const target = "/pl/";
---
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content={`0; url=${target}`} />
    <link rel="canonical" href={target} />
    <title>Silver</title>
  </head>
  <body>
    <a href={target}>Silver — strona koła</a>
  </body>
</html>
```

`src/pages/pl/index.astro` and `src/pages/en/index.astro` (temporary, replaced in Task 6):

```astro
---
---
<!doctype html>
<html lang="pl"><head><meta charset="utf-8" /><title>Silver</title></head><body><h1>Silver</h1></body></html>
```

(use `lang="en"` in the EN file).

- [ ] **Step 8: Install and verify**

Run: `mise install && bun install && bun run check && bun run lint && bun run fmt:check && bun run build`
Expected: `astro check` reports 0 errors; oxlint 0 warnings; oxfmt no diffs; `dist/index.html` contains `url=/pl/`; `dist/pl/index.html` and `dist/en/index.html` exist.

- [ ] **Step 9: Update the spec's stack line**

In spec §9 replace `Astro 5` with `Astro 7` and change `redirectToDefaultLocale: true` to `redirectToDefaultLocale: false` with the sentence "`/` is a hand-written `src/pages/index.astro`". Keep everything else.

- [ ] **Step 10: Commit**

```bash
git add mise.toml package.json bun.lock tsconfig.json astro.config.ts .oxlintrc.json .oxfmtrc.json .gitignore src/pages docs/superpowers/specs
git commit -m "Scaffold the Astro site with bun, oxlint, oxfmt and mise

Claude-Session: https://claude.ai/code/session_01XnMq4CaXuK3EoJQZAGVBVk"
```

---

### Task 2: Content schemas, site facts, projects, history

**Files:**
- Create: `src/lib/schemas.ts`, `src/content.config.ts`, `src/content/site.json`, `src/content/projects/{kampus-sggw,plan-wzim,dni-sggw,charmander}.json`, `src/content/history/*.json` (11 files)
- Test: `tests/content.test.ts`

**Interfaces:**
- Produces:
  - `LocalizedString = { pl: string; en: string }`
  - `SiteSchema`, `ProjectSchema`, `HistorySchema` (Zod) and types `Site`, `Project`, `HistoryEntry`
  - collections `site` (single entry id `site`), `projects` (ids = filenames), `history` (ids = filenames)
  - `Project.status: "store" | "github"`, `Project.order: number` (lower first)

- [ ] **Step 1: Write the failing test**

`tests/content.test.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { HistorySchema, ProjectSchema, SiteSchema } from "../src/lib/schemas";

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
  test("every entry has a year between 2013 and now", () => {
    const now = new Date().getFullYear();
    for (const [file, data] of listJson("history")) {
      const h = HistorySchema.parse(data);
      const start = "year" in h ? h.year : h.yearFrom;
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
```

- [ ] **Step 2: Run the test to see it fail**

Run: `bun test tests/content.test.ts`
Expected: FAIL — cannot resolve `../src/lib/schemas`.

- [ ] **Step 3: Write `src/lib/schemas.ts`**

```ts
import { z } from "astro/zod";

export const LocalizedString = z.object({ pl: z.string().min(1), en: z.string().min(1) });
export type LocalizedString = z.infer<typeof LocalizedString>;

export const SiteSchema = z.object({
  name: z.string(),
  formalName: z.string(),
  faculty: LocalizedString,
  university: z.string(),
  since: z.number().int(),
  room: z.string(),
  address: z.array(z.string()).min(1),
  chair: z.string(),
  discord: z.string().url(),
  email: z.string().email(),
  github: z.string().url(),
  facebook: z.string().url(),
});
export type Site = z.infer<typeof SiteSchema>;

export const ProjectSchema = z.object({
  name: z.string(),
  order: z.number().int(),
  status: z.enum(["store", "github"]),
  platforms: z.array(z.enum(["android", "ios", "web", "api"])),
  links: z.object({
    play: z.string().url().optional(),
    appStore: z.string().url().optional(),
    github: z.string().url().optional(),
  }),
  tech: z.array(z.string()).min(1),
  summary: LocalizedString,
  result: LocalizedString,
  screenshot: z.string().optional(),
});
export type Project = z.infer<typeof ProjectSchema>;

const HistoryBase = z.object({
  order: z.number().int().default(0),
  title: LocalizedString,
  body: LocalizedString,
});
export const HistorySchema = z.union([
  HistoryBase.extend({ year: z.number().int() }),
  HistoryBase.extend({ yearFrom: z.number().int(), yearTo: z.number().int() }),
]);
export type HistoryEntry = z.infer<typeof HistorySchema>;

export const historyStart = (h: HistoryEntry): number => ("year" in h ? h.year : h.yearFrom);
```

- [ ] **Step 4: Write `src/content.config.ts`**

```ts
import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { HistorySchema, ProjectSchema, SiteSchema } from "./lib/schemas";

const site = defineCollection({
  loader: file("src/content/site.json", {
    parser: (text) => [{ id: "site", ...JSON.parse(text) }],
  }),
  schema: SiteSchema,
});

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "*.json" }),
  schema: ProjectSchema,
});

const history = defineCollection({
  loader: glob({ base: "./src/content/history", pattern: "*.json" }),
  schema: HistorySchema,
});

export const collections = { site, projects, history };
```

(`copy` is added to this file in Task 3.)

- [ ] **Step 5: Write `src/content/site.json`**

```json
{
  "name": "Silver",
  "formalName": "Koło Naukowe Informatyków Silver .NET",
  "faculty": {
    "pl": "Wydział Zastosowań Informatyki i Matematyki",
    "en": "Faculty of Applied Informatics and Mathematics"
  },
  "university": "SGGW",
  "since": 2013,
  "room": "3/79",
  "address": ["ul. Nowoursynowska 159, budynek 34", "02-776 Warszawa"],
  "chair": "Jakub Orchowski",
  "discord": "https://discord.gg/JGPZCtB",
  "email": "kontakt@silver.sggw.pl",
  "github": "https://github.com/SilverNETGroupSGGW",
  "facebook": "https://www.facebook.com/silvernetgroupsggw"
}
```

- [ ] **Step 6: Write the four project files**

`src/content/projects/kampus-sggw.json`:

```json
{
  "name": "Kampus SGGW",
  "order": 1,
  "status": "store",
  "platforms": ["android", "ios"],
  "links": {
    "play": "https://play.google.com/store/apps/details?id=com.silvers.kampus_sggw_remake",
    "appStore": "https://apps.apple.com/pl/app/kampus-sggw/id1586959639",
    "github": "https://github.com/SilverNETGroupSGGW/kampus_sggw"
  },
  "tech": ["Flutter", "Dart"],
  "summary": {
    "pl": "Mapa kampusu w telefonie: budynki, sale, stołówki, przystanki. Znajdujesz salę egzaminu, zanim zacznie się egzamin.",
    "en": "The campus in your pocket: buildings, rooms, canteens, bus stops. Find the exam room before the exam starts."
  },
  "result": { "pl": "1 tys.+ pobrań · Android i iOS", "en": "1K+ downloads · Android and iOS" },
  "screenshot": "kampus-sggw-map.jpg"
}
```

`src/content/projects/plan-wzim.json`:

```json
{
  "name": "Plan WZIM",
  "order": 2,
  "status": "store",
  "platforms": ["android", "ios"],
  "links": {
    "play": "https://play.google.com/store/apps/details?id=com.silvernet.silvertimetable",
    "appStore": "https://apps.apple.com/pl/app/plan-wzim/id1384573148"
  },
  "tech": ["Flutter", "Dart"],
  "summary": {
    "pl": "Plan zajęć wydziału w telefonie. Twoja grupa, przerwy, sala na planie budynku, osobny widok dla prowadzących.",
    "en": "The faculty timetable on your phone. Your group, the breaks, the room on a floor plan, a separate view for lecturers."
  },
  "result": { "pl": "1 tys.+ pobrań · Android i iOS", "en": "1K+ downloads · Android and iOS" },
  "screenshot": "plan-wzim-day.png"
}
```

`src/content/projects/dni-sggw.json`:

```json
{
  "name": "Dni SGGW",
  "order": 3,
  "status": "github",
  "platforms": ["android", "ios", "web"],
  "links": { "github": "https://github.com/SilverNETGroupSGGW/sggw_days" },
  "tech": ["Flutter", "Firebase", "GitHub Actions"],
  "summary": {
    "pl": "Aplikacja na Dni SGGW 2026: program, mapa, powiadomienia. Na czas wydarzenia w Google Play, App Store i w przeglądarce.",
    "en": "The app for SGGW Days 2026: schedule, map, notifications. Live in Google Play, the App Store and the browser for the event."
  },
  "result": { "pl": "80+ pobrań w dwa dni wydarzenia", "en": "80+ downloads over the two event days" }
}
```

`src/content/projects/charmander.json`:

```json
{
  "name": "Charmander",
  "order": 4,
  "status": "github",
  "platforms": ["web", "api"],
  "links": { "github": "https://github.com/SilverNETGroupSGGW/Charmander" },
  "tech": [".NET Minimal API", "FastAPI", "React", "Firebase Cloud Messaging"],
  "summary": {
    "pl": "Proxy do powiadomień push w przeglądarce. Ten sam kontrakt API napisany dwa razy — w .NET i w Pythonie — żeby porównać.",
    "en": "A proxy for browser push notifications. The same API contract written twice — in .NET and in Python — to compare."
  },
  "result": { "pl": "Dwa backendy, jeden kontrakt", "en": "Two backends, one contract" }
}
```

- [ ] **Step 7: Write the eleven history files**

Filenames sort chronologically; `order` breaks ties within a year.

`src/content/history/2013-start.json`:

```json
{
  "year": 2013,
  "order": 0,
  "title": { "pl": "Start", "en": "The start" },
  "body": {
    "pl": "Koło zaczyna działać przy WZIM SGGW. Pierwsze warsztaty: Construct 2 i podstawy C# dla grupy Junior Silver .NET.",
    "en": "The club starts at WZIM SGGW. First workshops: Construct 2 and C# basics for the Junior Silver .NET group."
  }
}
```

`src/content/history/2013-it-academic-day.json`:

```json
{
  "year": 2013,
  "order": 1,
  "title": { "pl": "IT Academic Day", "en": "IT Academic Day" },
  "body": {
    "pl": "Koło organizuje IT Academic Day — dzień konferencji Dni Nowych Technologii na SGGW w Auli Kryształowej.",
    "en": "The club runs IT Academic Day — one day of the New Technology Days conference at SGGW, in the Crystal Hall."
  }
}
```

`src/content/history/2014-hackathons.json`:

```json
{
  "year": 2014,
  "order": 0,
  "title": { "pl": "Dwa maratony, dwa podia", "en": "Two marathons, two podiums" },
  "body": {
    "pl": "1. miejsce na Teslathonie (36 godzin): system wyborczy na wybory parlamentarne. 3. miejsce wśród blisko 100 drużyn .NET z całej Polski na Nocy Żywych Deweloperów (24 godziny, dziewięć aplikacji). W jury Predica, Microsoft i Vizao.",
    "en": "1st place at Teslathon (36 hours): an election system for the parliamentary vote. 3rd place among almost 100 .NET teams from across Poland at the Night of the Living Developers (24 hours, nine apps). Judges from Predica, Microsoft and Vizao."
  }
}
```

`src/content/history/2014-workshops.json`:

```json
{
  "yearFrom": 2014,
  "yearTo": 2015,
  "order": 1,
  "title": { "pl": "Warsztaty i pierwszy Kampus", "en": "Workshops and the first Kampus" },
  "body": {
    "pl": "Windows Phone 8.1, Unity3D, Akademia C#. W kwietniu 2015 pierwsza wersja aplikacji Kampus SGGW.",
    "en": "Windows Phone 8.1, Unity3D, the C# Academy. April 2015: the first version of the Kampus SGGW app."
  }
}
```

`src/content/history/2015-github.json`:

```json
{
  "year": 2015,
  "order": 2,
  "title": { "pl": "GitHub, Wokół, Giełda Pomysłów", "en": "GitHub, Wokół, Giełda Pomysłów" },
  "body": {
    "pl": "Organizacja koła na GitHubie. Portal Wokół dla kół naukowych SGGW i Giełda Pomysłów — platforma do zgłaszania tematów projektów i szukania współpracowników.",
    "en": "The club's GitHub organisation. Wokół, a portal for SGGW student clubs, and Giełda Pomysłów — a platform for pitching project ideas and finding collaborators."
  }
}
```

`src/content/history/2016-workshops.json`:

```json
{
  "yearFrom": 2016,
  "yearTo": 2018,
  "order": 0,
  "title": { "pl": "Trzy lata warsztatów", "en": "Three years of workshops" },
  "body": {
    "pl": "Programowanie obiektowe, C#/.NET, Android, Unity, ASP.NET MVC, zaawansowany C#, SFML. Każdy semestr z własnym cyklem.",
    "en": "Object-oriented programming, C#/.NET, Android, Unity, ASP.NET MVC, advanced C#, SFML. A new cycle every semester."
  }
}
```

`src/content/history/2018-plan-wzim.json`:

```json
{
  "year": 2018,
  "order": 1,
  "title": { "pl": "Plan WZIM", "en": "Plan WZIM" },
  "body": {
    "pl": "Plan zajęć wydziału w telefonie: powiadomienia o zmianach, widok dla prowadzących, sala na planie budynku.",
    "en": "The faculty timetable on a phone: change notifications, a lecturer view, the room on a floor plan."
  }
}
```

`src/content/history/2019-unity-flutter.json`:

```json
{
  "year": 2019,
  "order": 0,
  "title": { "pl": "STEAMY i Flutter", "en": "STEAMY and Flutter" },
  "body": {
    "pl": "Warsztaty Unity i Flutter zakończone projektami. STEAMY — gra platformowa 2D z własną grafiką i muzyką, siedmioosobowy zespół. Od tego roku Flutter zostaje w kole na stałe.",
    "en": "Unity and Flutter workshops that ended in projects. STEAMY — a 2D platformer with original art and music, a seven-person team. Flutter has stayed in the club ever since."
  }
}
```

`src/content/history/2021-git.json`:

```json
{
  "yearFrom": 2021,
  "yearTo": 2022,
  "order": 0,
  "title": { "pl": "Git i nowy Kampus", "en": "Git and a new Kampus" },
  "body": {
    "pl": "Warsztaty z Gita i GitHuba. Kampus SGGW napisany od nowa we Flutterze, w Google Play i App Store.",
    "en": "Git and GitHub workshops. Kampus SGGW rewritten in Flutter, in Google Play and the App Store."
  }
}
```

`src/content/history/2023-plan-wzim.json`:

```json
{
  "year": 2023,
  "order": 0,
  "title": { "pl": "Plan WZIM, duża aktualizacja", "en": "Plan WZIM, a big update" },
  "body": {
    "pl": "Ostatnia duża aktualizacja Planu WZIM.",
    "en": "The last major update of Plan WZIM."
  }
}
```

`src/content/history/2026-now.json`:

```json
{
  "year": 2026,
  "order": 0,
  "title": { "pl": "HackArena, Dni SGGW, nowy zespół", "en": "HackArena, SGGW Days, a new team" },
  "body": {
    "pl": "Marzec: HackArena 3.0 — 4. miejsce w finałowym starciu, 16. w klasyfikacji łącznej wśród 33 drużyn. Aplikacja Dni SGGW: ponad 80 pobrań w dwa dni wydarzenia. 27 maja: pierwsze spotkanie nowego zespołu na żywo. Charmander — proxy do powiadomień push.",
    "en": "March: HackArena 3.0 — 4th in the final race, 16th overall among 33 teams. The SGGW Days app: 80+ downloads over the two event days. 27 May: the new team's first in-person meeting. Charmander — a push-notification proxy."
  }
}
```

- [ ] **Step 8: Run the tests**

Run: `bun test tests/content.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 9: Verify the build sees the collections**

Run: `bun run check && bun run build`
Expected: 0 errors; `.astro/collections/` lists `site`, `projects`, `history`.

- [ ] **Step 10: Commit**

```bash
git add src/lib/schemas.ts src/content.config.ts src/content tests/content.test.ts
git commit -m "Add content schemas, site facts, projects and history entries

Claude-Session: https://claude.ai/code/session_01XnMq4CaXuK3EoJQZAGVBVk"
```

---

### Task 3: Copy for both locales

**Files:**
- Create: `src/content/copy/pl.json`, `src/content/copy/en.json`
- Modify: `src/lib/schemas.ts` (add `CopySchema`), `src/content.config.ts` (add `copy` collection), `tests/content.test.ts` (add copy tests)

**Interfaces:**
- Produces: `CopySchema`, type `Copy`; collection `copy` with entries `pl` and `en`; `getEntry("copy", locale)` returns the whole string tree.

- [ ] **Step 1: Add the failing test**

Append to `tests/content.test.ts`:

```ts
import { CopySchema } from "../src/lib/schemas";

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
      const { history: _history, ...rest } = CopySchema.parse(readJson(join(root, "copy", `${locale}.json`)));
      expect(JSON.stringify(rest), locale).not.toMatch(forbidden);
    }
  });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `bun test tests/content.test.ts`
Expected: FAIL — `CopySchema` is not exported.

- [ ] **Step 3: Add `CopySchema` to `src/lib/schemas.ts`**

```ts
const Step = z.object({ title: z.string(), body: z.string() });

export const CopySchema = z.object({
  meta: z.object({ title: z.string(), description: z.string() }),
  nav: z.object({
    projects: z.string(),
    history: z.string(),
    join: z.string(),
    switchTo: z.string(),
    skip: z.string(),
  }),
  hero: z.object({
    title: z.string(),
    lead: z.string(),
    ctaDiscord: z.string(),
    ctaProjects: z.string(),
  }),
  steps: z.object({
    heading: z.string(),
    items: z.tuple([Step, Step, Step]),
    hackathons: z.string(),
  }),
  projects: z.object({
    heading: z.string(),
    lead: z.string(),
    viewAll: z.string(),
    filterAll: z.string(),
    filterStore: z.string(),
    filterGithub: z.string(),
    play: z.string(),
    appStore: z.string(),
    github: z.string(),
  }),
  build: z.object({ heading: z.string(), what: z.string(), how: z.string(), inOrg: z.string() }),
  join: z.object({
    heading: z.string(),
    lead: z.string(),
    threshold: z.string(),
    discord: z.string(),
    email: z.string(),
    room: z.string(),
  }),
  footer: z.object({ since: z.string(), contact: z.string(), links: z.string() }),
  history: z.object({ heading: z.string(), lead: z.string() }),
  brochure: z.object({
    students: z.object({
      title: z.string(),
      lead: z.string(),
      stepsHeading: z.string(),
      appsHeading: z.string(),
      threshold: z.string(),
      qrLabel: z.string(),
    }),
    companies: z.object({
      title: z.string(),
      lead: z.string(),
      whoHeading: z.string(),
      who: z.string(),
      builtHeading: z.string(),
      togetherHeading: z.string(),
      together: z.tuple([z.string(), z.string(), z.string()]),
      contactHeading: z.string(),
      qrLabel: z.string(),
    }),
  }),
});
export type Copy = z.infer<typeof CopySchema>;
```

- [ ] **Step 4: Register the collection**

In `src/content.config.ts` add:

```ts
import { CopySchema } from "./lib/schemas";

const copy = defineCollection({
  loader: glob({ base: "./src/content/copy", pattern: "*.json" }),
  schema: CopySchema,
});
```

and export `{ site, projects, history, copy }`.

- [ ] **Step 5: Write `src/content/copy/pl.json`**

```json
{
  "meta": {
    "title": "Silver — koło naukowe informatyków SGGW",
    "description": "Koło naukowe informatyków na SGGW. Piszemy aplikacje, z których korzysta kampus."
  },
  "nav": {
    "projects": "Projekty",
    "history": "Historia",
    "join": "Dołącz",
    "switchTo": "English",
    "skip": "Przejdź do treści"
  },
  "hero": {
    "title": "Koło naukowe informatyków na SGGW.",
    "lead": "Piszemy aplikacje, z których korzysta kampus — i uczymy się na nich więcej niż na zajęciach.",
    "ctaDiscord": "Dołącz na Discordzie",
    "ctaProjects": "Zobacz projekty"
  },
  "steps": {
    "heading": "Jak to działa",
    "items": [
      { "title": "Wchodzisz na Discorda", "body": "Tam jest wszystko: projekty, terminy, ludzie. Przedstaw się jednym zdaniem." },
      { "title": "Wybierasz projekt albo zgłaszasz swój", "body": "Dołączasz do czegoś, co już się dzieje, albo przychodzisz z pomysłem i szukasz dwóch osób." },
      { "title": "Robimy to przez semestr", "body": "W małym zespole, w swoim tempie. Co jakiś czas spotykamy się na żywo w sali 3/79." }
    ],
    "hackathons": "Jeździmy też na hackathony. HackArena 3.0, marzec 2026: 4. miejsce w finale."
  },
  "projects": {
    "heading": "Projekty",
    "lead": "Dwie z naszych aplikacji są w sklepach i mają po ponad tysiąc pobrań. Reszta jest na GitHubie.",
    "viewAll": "Wszystkie projekty",
    "filterAll": "Wszystkie",
    "filterStore": "W sklepach",
    "filterGithub": "Na GitHubie",
    "play": "Google Play",
    "appStore": "App Store",
    "github": "GitHub"
  },
  "build": {
    "heading": "Co budujemy i czym",
    "what": "Część z tego, co robimy, rozwiązuje problemy, które sami mamy na uczelni — stąd plan zajęć w telefonie i mapa kampusu. Reszta powstaje, bo ktoś chciał sprawdzić nową technologię albo zrobić znaną rzecz po swojemu.",
    "how": "Nie mamy jednego stacku. Dobieramy narzędzia pod projekt i chętnie sięgamy po nowe rzeczy — czasem zanim ktokolwiek uzna je za stabilne.",
    "inOrg": "W naszym orgu na GitHubie:"
  },
  "join": {
    "heading": "Dołącz",
    "lead": "Nie musisz jeszcze umieć programować. Wystarczy, że chcesz coś zbudować.",
    "threshold": "Wejdź na Discorda, przedstaw się, wybierz projekt. Terminy spotkań na żywo ogłaszamy tam.",
    "discord": "Discord",
    "email": "Mail",
    "room": "Sala"
  },
  "footer": {
    "since": "Przy WZIM SGGW od {year}",
    "contact": "Kontakt",
    "links": "Linki"
  },
  "history": {
    "heading": "Historia",
    "lead": "Co się działo w kole, rok po roku."
  },
  "brochure": {
    "students": {
      "title": "Koło naukowe informatyków na SGGW",
      "lead": "Piszemy aplikacje, z których korzysta kampus — i uczymy się na nich więcej niż na zajęciach.",
      "stepsHeading": "Jak to działa",
      "appsHeading": "Nasze aplikacje w sklepach",
      "threshold": "Nie musisz jeszcze umieć programować. Wystarczy, że chcesz coś zbudować.",
      "qrLabel": "Zeskanuj — wejdziesz na nasz Discord"
    },
    "companies": {
      "title": "Silver — koło naukowe informatyków SGGW",
      "lead": "Siedmioosobowy zespół studentów, który wypuszcza aplikacje do sklepów.",
      "whoHeading": "Kim jesteśmy",
      "who": "Koło Naukowe Informatyków Silver .NET przy Wydziale Zastosowań Informatyki i Matematyki SGGW. Robimy aplikacje mobilne i webowe — dla studentów kampusu i dla siebie.",
      "builtHeading": "Co zbudowaliśmy",
      "togetherHeading": "Co możemy zrobić razem",
      "together": [
        "Warsztat lub prelekcja dla studentów informatyki SGGW — sala na WZIM, publiczność zapewniamy.",
        "Wspólny projekt: realny problem z waszej strony, zespół z naszej.",
        "Wsparcie wydarzenia — hackathonu, konkursu, Dni SGGW."
      ],
      "contactHeading": "Kontakt",
      "qrLabel": "Zeskanuj — napiszesz do nas maila"
    }
  }
}
```

- [ ] **Step 6: Write `src/content/copy/en.json`**

```json
{
  "meta": {
    "title": "Silver — SGGW computer science student club",
    "description": "The computer science student club at SGGW. We write the apps the campus uses."
  },
  "nav": {
    "projects": "Projects",
    "history": "History",
    "join": "Join",
    "switchTo": "Polski",
    "skip": "Skip to content"
  },
  "hero": {
    "title": "The computer science club at SGGW.",
    "lead": "We write the apps the campus uses — and learn more from them than from classes.",
    "ctaDiscord": "Join on Discord",
    "ctaProjects": "See the projects"
  },
  "steps": {
    "heading": "How it works",
    "items": [
      { "title": "Join the Discord", "body": "Everything is there: projects, dates, people. Introduce yourself in one sentence." },
      { "title": "Pick a project or pitch your own", "body": "Join something already moving, or bring an idea and find two people for it." },
      { "title": "Build it over the semester", "body": "In a small team, at your own pace. Every so often we meet in person in room 3/79." }
    ],
    "hackathons": "We go to hackathons too. HackArena 3.0, March 2026: 4th place in the final."
  },
  "projects": {
    "heading": "Projects",
    "lead": "Two of our apps are in the stores with over a thousand downloads each. The rest is on GitHub.",
    "viewAll": "All projects",
    "filterAll": "All",
    "filterStore": "In stores",
    "filterGithub": "On GitHub",
    "play": "Google Play",
    "appStore": "App Store",
    "github": "GitHub"
  },
  "build": {
    "heading": "What we build, and with what",
    "what": "Some of what we make solves problems we have at university ourselves — hence the timetable app and the campus map. The rest exists because someone wanted to try a new technology or do a familiar thing their own way.",
    "how": "There is no single stack. We pick tools per project and happily reach for new things — sometimes before anyone calls them stable.",
    "inOrg": "In our GitHub org:"
  },
  "join": {
    "heading": "Join",
    "lead": "You don't need to know how to code yet. Wanting to build something is enough.",
    "threshold": "Join the Discord, introduce yourself, pick a project. In-person meetings are announced there.",
    "discord": "Discord",
    "email": "Email",
    "room": "Room"
  },
  "footer": {
    "since": "At WZIM SGGW since {year}",
    "contact": "Contact",
    "links": "Links"
  },
  "history": {
    "heading": "History",
    "lead": "What happened in the club, year by year."
  },
  "brochure": {
    "students": {
      "title": "The computer science club at SGGW",
      "lead": "We write the apps the campus uses — and learn more from them than from classes.",
      "stepsHeading": "How it works",
      "appsHeading": "Our apps in the stores",
      "threshold": "You don't need to know how to code yet. Wanting to build something is enough.",
      "qrLabel": "Scan to join our Discord"
    },
    "companies": {
      "title": "Silver — SGGW computer science student club",
      "lead": "A seven-person student team that ships apps to the stores.",
      "whoHeading": "Who we are",
      "who": "The Silver .NET computer science student club at the Faculty of Applied Informatics and Mathematics, SGGW. We build mobile and web apps — for the campus and for ourselves.",
      "builtHeading": "What we've built",
      "togetherHeading": "What we can do together",
      "together": [
        "A workshop or talk for SGGW computer science students — we provide the room and the audience.",
        "A joint project: a real problem from your side, a team from ours.",
        "Backing an event — a hackathon, a contest, SGGW Days."
      ],
      "contactHeading": "Contact",
      "qrLabel": "Scan to email us"
    }
  }
}
```

- [ ] **Step 7: Run the tests and the build**

Run: `bun test && bun run check && bun run build`
Expected: all green; `.astro/collections/copy` exists.

- [ ] **Step 8: Commit**

```bash
git add src/lib/schemas.ts src/content.config.ts src/content/copy tests/content.test.ts
git commit -m "Add the PL and EN copy under one schema

Claude-Session: https://claude.ai/code/session_01XnMq4CaXuK3EoJQZAGVBVk"
```

---

### Task 4: i18n helpers

**Files:**
- Create: `src/lib/i18n.ts`
- Test: `tests/i18n.test.ts`

**Interfaces:**
- Produces:
  - `type Locale = "pl" | "en"`, `const locales: readonly Locale[]`
  - `type RouteKey = "home" | "projects" | "history" | "brochureStudents" | "brochureCompanies"`
  - `pathFor(key: RouteKey, locale: Locale): string` — always with leading and trailing slash
  - `otherLocale(locale: Locale): Locale`
  - `fill(template: string, vars: Record<string, string | number>): string` — replaces `{name}`

- [ ] **Step 1: Write the failing test**

`tests/i18n.test.ts`:

```ts
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
      for (const key of ["home", "projects", "history", "brochureStudents", "brochureCompanies"] as const) {
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
```

- [ ] **Step 2: Run to see it fail**

Run: `bun test tests/i18n.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/i18n.ts`**

```ts
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
```

- [ ] **Step 4: Run the tests**

Run: `bun test tests/i18n.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n.ts tests/i18n.test.ts
git commit -m "Add locale routes and template helpers

Claude-Session: https://claude.ai/code/session_01XnMq4CaXuK3EoJQZAGVBVk"
```

---

### Task 5: Logo export, fonts, design tokens

**Files:**
- Create: `brand/logo/settings.json`, `scripts/export-logo.ts`, `brand/logo/mark.svg`, `brand/logo/mark-transparent.svg`, `brand/logo/geometry.json`, `public/fonts/Geist-Variable.woff2`, `public/fonts/GeistMono-Variable.woff2`, `public/fonts/LICENSE.txt`, `public/favicon.svg`, `src/styles/tokens.css`, `src/styles/base.css`

**Interfaces:**
- Produces: CSS custom properties `--bg`, `--surface`, `--surface-2`, `--line`, `--ink`, `--muted`, `--bright`, `--angle`, `--font-sans`, `--font-mono`, `--step--1` … `--step-5`, `--space-*`, `--measure`; classes `.container`, `.visually-hidden`, `.mono`.
- Produces: `brand/logo/geometry.json` `{ "angleDeg": number }` consumed by tokens.css (copied by hand into `--angle`, with the file as the source of truth).

- [ ] **Step 1: Write `brand/logo/settings.json`**

```json
{"scale":0.74,"neck":8,"entryH":87,"waistTilt":40,"waistH":150,"lineWidth":50,"bandWidth":136,"slopeLen":168,"slopeStart":94,"slopeCurve":100,"slopeRound":20,"lean":-0.9,"zoom":2,"brightness":1,"bg":"#16161b","ink":"#d8dbde","solidColor":false,"texX":-44,"texY":0,"texMirrorX":true,"texMirrorY":true,"transparent":false}
```

- [ ] **Step 2: Write `scripts/export-logo.ts`**

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = resolve(import.meta.dir, "..");
const out = join(root, "brand", "logo");
mkdirSync(out, { recursive: true });

const settings = JSON.parse(await Bun.file(join(out, "settings.json")).text());

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(join(root, "logo-configurator.html")).href);
await page.evaluate((s) => {
  // @ts-expect-error configurator globals
  applySettings(s);
}, settings);
// refreshTexture() runs from an <img> onload, so the first render is async
await page.waitForFunction(() => {
  // @ts-expect-error configurator globals
  return typeof textureUri === "string";
});

const result = await page.evaluate(() => {
  // @ts-expect-error configurator globals
  const { u2 } = bandAxis(state);
  const angleDeg = Math.abs((Math.atan2(u2[1], u2[0]) * 180) / Math.PI);
  return {
    // @ts-expect-error configurator globals
    withBg: svgString(state, textureUri, true) as string,
    // @ts-expect-error configurator globals
    transparent: svgString(state, textureUri, false) as string,
    angleDeg: Number(angleDeg.toFixed(2)),
  };
});
await browser.close();

writeFileSync(join(out, "mark.svg"), result.withBg);
writeFileSync(join(out, "mark-transparent.svg"), result.transparent);
writeFileSync(join(out, "geometry.json"), JSON.stringify({ angleDeg: result.angleDeg }, null, 2) + "\n");
console.log(`exported mark.svg, mark-transparent.svg, angle ${result.angleDeg}°`);
```

- [ ] **Step 3: Install the browser and run the export**

Run: `bunx playwright install chromium && bun run logo:export`
Expected: prints the angle (a value between 20 and 40); `brand/logo/mark.svg` starts with `<svg` and contains `<pattern id="foil"`; open `brand/logo/mark.svg` in a browser and compare with the configurator at the same settings — identical.

If `applySettings` is not reachable as a global, the configurator's script is a classic `<script>` (not `type="module"`) and functions are globals — check `grep -n '<script' logo-configurator.html`; this plan was written against a classic script.

- [ ] **Step 4: Copy the fonts**

```bash
mkdir -p public/fonts
cp node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2 public/fonts/
cp node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2 public/fonts/
cp node_modules/geist/LICENSE.txt public/fonts/LICENSE.txt
```

- [ ] **Step 5: Write `public/favicon.svg`**

A flat-colour S on the dark ground, taken from `brand/logo/mark-transparent.svg`: copy that file, remove the `<defs>` block and replace `fill="url(#foil)"` with `fill="#D8DBDE"`, add a `<rect width="100%" height="100%" fill="#16161B"/>` as the first child. Keep the viewBox.

- [ ] **Step 6: Write `src/styles/tokens.css`**

Replace `27.5deg` with the value from `brand/logo/geometry.json`.

```css
@font-face {
  font-family: "Geist";
  src: url("/fonts/Geist-Variable.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
}
@font-face {
  font-family: "Geist Mono";
  src: url("/fonts/GeistMono-Variable.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
}

:root {
  color-scheme: dark;

  --bg: #16161b;
  --surface: #1e1e24;
  --surface-2: #26262d;
  --line: #34343c;
  --ink: #d8dbde;
  --muted: #9a9ea5;
  --bright: #f2f3f5;

  /* band angle of the S mark, from brand/logo/geometry.json */
  --angle: 27.5deg;

  --font-sans: "Geist", system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, monospace;

  --step--1: clamp(0.83rem, 0.8rem + 0.15vw, 0.9rem);
  --step-0: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --step-1: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);
  --step-2: clamp(1.56rem, 1.35rem + 1vw, 2.1rem);
  --step-3: clamp(1.95rem, 1.5rem + 2vw, 3rem);
  --step-4: clamp(2.44rem, 1.6rem + 4vw, 4.5rem);
  --step-5: clamp(3rem, 1.5rem + 7vw, 7rem);

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2.5rem;
  --space-6: 4rem;
  --space-7: 6rem;

  --measure: 62ch;
  --container: 72rem;
  --gutter: clamp(1rem, 4vw, 2.5rem);
}
```

Contrast check (record the numbers in the commit message): `--ink` on `--bg` ≈ 12.9:1, `--muted` on `--bg` ≈ 6.4:1, `--muted` on `--surface` ≈ 6.0:1. All ≥ 4.5:1.

- [ ] **Step 7: Write `src/styles/base.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
html {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: var(--step-0);
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
}
body {
  margin: 0;
  min-height: 100vh;
}
h1,
h2,
h3,
p {
  margin: 0;
}
h1,
h2,
h3 {
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-weight: 600;
  text-wrap: balance;
}
p {
  max-width: var(--measure);
  text-wrap: pretty;
}
a {
  color: inherit;
  text-underline-offset: 0.15em;
}
img,
svg {
  display: block;
  max-width: 100%;
  height: auto;
}
:focus-visible {
  outline: 2px solid var(--bright);
  outline-offset: 3px;
}
.container {
  width: min(100% - 2 * var(--gutter), var(--container));
  margin-inline: auto;
}
.mono {
  font-family: var(--font-mono);
  font-size: var(--step--1);
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
```

- [ ] **Step 8: Lint, format, commit**

Run: `bun run lint && bun run fmt && bun run check`
Expected: green.

```bash
git add brand/logo scripts/export-logo.ts public/fonts public/favicon.svg src/styles
git commit -m "Export the logo from the configurator; add fonts and design tokens

Claude-Session: https://claude.ai/code/session_01XnMq4CaXuK3EoJQZAGVBVk"
```

---

### Task 6: Layout, header, footer, mark, home hero

**Files:**
- Create: `src/layouts/Base.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/LocaleSwitch.astro`, `src/components/Button.astro`, `src/components/Mark.astro`, `src/views/Home.astro`
- Modify: `src/pages/pl/index.astro`, `src/pages/en/index.astro`

**Interfaces:**
- Consumes: `pathFor`, `otherLocale`, `fill`, `Locale`, `RouteKey` (Task 4); collections `copy`, `site` (Tasks 2–3); tokens (Task 5).
- Produces:
  - `Base.astro` props `{ locale: Locale; route: RouteKey; title: string; description: string }`; slot default.
  - `Button.astro` props `{ href: string; variant?: "primary" | "ghost" }`.
  - `Mark.astro` props `{ size?: string; interactive?: boolean }` — inline SVG from `brand/logo/mark-transparent.svg`; `interactive` adds the pointer foil script (Task 9).
  - `Home.astro` props `{ locale: Locale }`.

- [ ] **Step 1: Write `src/layouts/Base.astro`**

```astro
---
import { getEntry } from "astro:content";
import Footer from "../components/Footer.astro";
import Header from "../components/Header.astro";
import { locales, pathFor, type Locale, type RouteKey } from "../lib/i18n";
import "../styles/tokens.css";
import "../styles/base.css";

interface Props {
  locale: Locale;
  route: RouteKey;
  title: string;
  description: string;
}
const { locale, route, title, description } = Astro.props;
const copy = (await getEntry("copy", locale))!.data;
const canonical = new URL(pathFor(route, locale), Astro.site);
---
<!doctype html>
<html lang={locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    {locales.map((l) => <link rel="alternate" hreflang={l} href={new URL(pathFor(route, l), Astro.site)} />)}
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preload" href="/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin />
    <meta name="theme-color" content="#16161B" />
  </head>
  <body>
    <a class="visually-hidden" href="#main">{copy.nav.skip}</a>
    <Header locale={locale} route={route} />
    <main id="main">
      <slot />
    </main>
    <Footer locale={locale} />
  </body>
</html>
```

- [ ] **Step 2: Write `src/components/Button.astro`**

```astro
---
interface Props {
  href: string;
  variant?: "primary" | "ghost";
}
const { href, variant = "primary" } = Astro.props;
---
<a class:list={["button", variant]} href={href}><slot /></a>

<style>
  .button {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 0.75em 1.25em;
    border: 1px solid var(--ink);
    border-radius: 999px;
    font-weight: 500;
    text-decoration: none;
    transition: background-color 120ms, color 120ms;
  }
  .primary {
    background: var(--ink);
    color: var(--bg);
  }
  .primary:hover {
    background: var(--bright);
  }
  .ghost:hover {
    background: var(--surface);
  }
</style>
```

- [ ] **Step 3: Write `src/components/Mark.astro`**

```astro
---
import { readFileSync } from "node:fs";

interface Props {
  size?: string;
  interactive?: boolean;
}
const { size = "4rem", interactive = false } = Astro.props;
const svg = readFileSync(new URL("../../brand/logo/mark-transparent.svg", import.meta.url), "utf8");
---
<span class="mark" style={`--size:${size}`} data-foil={interactive ? "" : undefined} set:html={svg} aria-hidden="true" />

<style>
  .mark {
    display: inline-block;
    inline-size: var(--size);
    aspect-ratio: 1;
  }
  .mark :global(svg) {
    inline-size: 100%;
    block-size: 100%;
  }
</style>
```

- [ ] **Step 4: Write `src/components/LocaleSwitch.astro`**

```astro
---
import { getEntry } from "astro:content";
import { otherLocale, pathFor, type Locale, type RouteKey } from "../lib/i18n";

interface Props {
  locale: Locale;
  route: RouteKey;
}
const { locale, route } = Astro.props;
const copy = (await getEntry("copy", locale))!.data;
const target = otherLocale(locale);
---
<a class="switch mono" href={pathFor(route, target)} hreflang={target} lang={target}>{copy.nav.switchTo}</a>

<style>
  .switch {
    text-decoration: none;
    color: var(--muted);
  }
  .switch:hover {
    color: var(--ink);
  }
</style>
```

- [ ] **Step 5: Write `src/components/Header.astro`**

```astro
---
import { getEntry } from "astro:content";
import { pathFor, type Locale, type RouteKey } from "../lib/i18n";
import LocaleSwitch from "./LocaleSwitch.astro";
import Mark from "./Mark.astro";

interface Props {
  locale: Locale;
  route: RouteKey;
}
const { locale, route } = Astro.props;
const copy = (await getEntry("copy", locale))!.data;
const site = (await getEntry("site", "site"))!.data;
const links = [
  { href: pathFor("projects", locale), label: copy.nav.projects, key: "projects" },
  { href: pathFor("history", locale), label: copy.nav.history, key: "history" },
  { href: `${pathFor("home", locale)}#join`, label: copy.nav.join, key: "join" },
];
---
<header class="header">
  <div class="container row">
    <a class="brand" href={pathFor("home", locale)} aria-label={site.name}>
      <Mark size="2rem" />
      <span>{site.name}</span>
    </a>
    <nav aria-label="Main">
      {links.map((l) => (
        <a href={l.href} aria-current={l.key === route ? "page" : undefined}>{l.label}</a>
      ))}
      <LocaleSwitch locale={locale} route={route} />
    </nav>
  </div>
</header>

<style>
  .header {
    padding-block: var(--space-3);
    border-bottom: 1px solid var(--line);
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    flex-wrap: wrap;
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: 600;
    text-decoration: none;
  }
  nav {
    display: flex;
    gap: var(--space-4);
    align-items: center;
  }
  nav a {
    text-decoration: none;
    color: var(--muted);
  }
  nav a:hover,
  nav a[aria-current="page"] {
    color: var(--ink);
  }
</style>
```

- [ ] **Step 6: Write `src/components/Footer.astro`**

```astro
---
import { getEntry } from "astro:content";
import { fill, pathFor, type Locale } from "../lib/i18n";

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const copy = (await getEntry("copy", locale))!.data;
const site = (await getEntry("site", "site"))!.data;
---
<footer class="footer">
  <div class="container grid">
    <div>
      <p class="name">{site.formalName}</p>
      <p class="muted">{site.faculty[locale]}, {site.university}</p>
      <p class="muted"><a href={pathFor("history", locale)}>{fill(copy.footer.since, { year: site.since })}</a></p>
    </div>
    <div>
      <p class="label">{copy.footer.contact}</p>
      <p class="mono"><a href={`mailto:${site.email}`}>{site.email}</a></p>
      {site.address.map((line) => <p class="mono muted">{line}</p>)}
      <p class="mono muted">{copy.join.room} {site.room}</p>
    </div>
    <div>
      <p class="label">{copy.footer.links}</p>
      <p><a href={site.discord}>Discord</a></p>
      <p><a href={site.github}>GitHub</a></p>
      <p><a href={site.facebook}>Facebook</a></p>
    </div>
  </div>
</footer>

<style>
  .footer {
    margin-top: var(--space-7);
    padding-block: var(--space-6);
    border-top: 1px solid var(--line);
  }
  .grid {
    display: grid;
    gap: var(--space-5);
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  }
  .name {
    font-weight: 600;
  }
  .label {
    color: var(--muted);
    font-size: var(--step--1);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: var(--space-2);
  }
  .muted {
    color: var(--muted);
  }
</style>
```

- [ ] **Step 7: Write `src/views/Home.astro` with the hero only**

```astro
---
import { getEntry } from "astro:content";
import Button from "../components/Button.astro";
import Mark from "../components/Mark.astro";
import Base from "../layouts/Base.astro";
import { pathFor, type Locale } from "../lib/i18n";

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const copy = (await getEntry("copy", locale))!.data;
const site = (await getEntry("site", "site"))!.data;
---
<Base locale={locale} route="home" title={copy.meta.title} description={copy.meta.description}>
  <section class="hero container">
    <div class="band" aria-hidden="true"></div>
    <Mark size="clamp(8rem, 30vw, 18rem)" interactive />
    <h1>{copy.hero.title}</h1>
    <p class="lead">{copy.hero.lead}</p>
    <div class="ctas">
      <Button href={site.discord}>{copy.hero.ctaDiscord}</Button>
      <Button href={pathFor("projects", locale)} variant="ghost">{copy.hero.ctaProjects}</Button>
    </div>
  </section>
</Base>

<style>
  .hero {
    position: relative;
    isolation: isolate;
    display: grid;
    gap: var(--space-4);
    padding-block: var(--space-7);
    overflow: hidden;
  }
  .band {
    position: absolute;
    inset: 0 -20%;
    z-index: -1;
    background: url("/brand/foil-texture.jpg") center / cover;
    opacity: 0.08;
    clip-path: polygon(0 100%, 100% calc(100% - 100% * tan(var(--angle))), 100% 100%);
  }
  h1 {
    font-size: var(--step-4);
    max-width: 18ch;
  }
  .lead {
    font-size: var(--step-1);
    color: var(--muted);
  }
  .ctas {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
</style>
```

The hero band reads the texture from `/brand/foil-texture.jpg`. Add a symlink-free copy: `mkdir -p public/brand && cp brand/foil-texture.jpg public/brand/foil-texture.jpg`. (`public/brand/` holds only this one file.)

- [ ] **Step 8: Replace the placeholder pages**

`src/pages/pl/index.astro`:

```astro
---
import Home from "../../views/Home.astro";
---
<Home locale="pl" />
```

`src/pages/en/index.astro`: the same with `locale="en"`.

- [ ] **Step 9: Verify in the browser**

Run: `bun run check && bun run build && bun run preview`
Open `http://localhost:4321/`, expect an immediate redirect to `/pl/`. Check: header links, locale switch goes to `/en/` and back, footer shows `Przy WZIM SGGW od 2013` linking to `/pl/historia/` (404 for now is expected), hero mark renders with the foil texture, no horizontal scroll at 400 px width.

- [ ] **Step 10: Commit**

```bash
git add src public/brand
git commit -m "Add the base layout, header, footer and home hero in both locales

Claude-Session: https://claude.ai/code/session_01XnMq4CaXuK3EoJQZAGVBVk"
```

---

### Task 7: Home sections — steps, projects, build, join

**Files:**
- Create: `src/components/ProjectCard.astro`, `src/components/Steps.astro`
- Modify: `src/views/Home.astro`

**Interfaces:**
- Consumes: `Project` type, `copy.projects`, `copy.steps`, `copy.build`, `copy.join`.
- Produces: `ProjectCard.astro` props `{ project: CollectionEntry<"projects">; locale: Locale; withScreenshot?: boolean }`; card root has `data-status="store" | "github"` (used by the filter in Task 8).

- [ ] **Step 1: Write `src/components/Steps.astro`**

```astro
---
import type { Copy } from "../lib/schemas";

interface Props {
  steps: Copy["steps"];
}
const { steps } = Astro.props;
---
<section class="steps container" aria-labelledby="steps-heading">
  <h2 id="steps-heading">{steps.heading}</h2>
  <ol>
    {steps.items.map((s, i) => (
      <li>
        <span class="n mono">0{i + 1}</span>
        <h3>{s.title}</h3>
        <p>{s.body}</p>
      </li>
    ))}
  </ol>
  <p class="hack">{steps.hackathons}</p>
</section>

<style>
  .steps {
    padding-block: var(--space-6);
    display: grid;
    gap: var(--space-4);
  }
  h2 {
    font-size: var(--step-3);
  }
  ol {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--space-4);
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
    counter-reset: step;
  }
  li {
    padding: var(--space-4);
    background: var(--surface);
    border: 1px solid var(--line);
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - 1.25rem), calc(100% - 1.25rem * tan(var(--angle))) 100%, 0 100%);
    display: grid;
    gap: var(--space-2);
  }
  .n {
    color: var(--muted);
  }
  h3 {
    font-size: var(--step-1);
  }
  p {
    color: var(--muted);
  }
  .hack {
    color: var(--muted);
  }
</style>
```

- [ ] **Step 2: Write `src/components/ProjectCard.astro`**

```astro
---
import type { CollectionEntry } from "astro:content";
import { getEntry } from "astro:content";
import { Image } from "astro:assets";
import type { Locale } from "../lib/i18n";

interface Props {
  project: CollectionEntry<"projects">;
  locale: Locale;
  withScreenshot?: boolean;
}
const { project, locale, withScreenshot = false } = Astro.props;
const p = project.data;
const copy = (await getEntry("copy", locale))!.data;

const screenshots = import.meta.glob<{ default: ImageMetadata }>("../../brand/screenshots/*.{png,jpg}");
const shot =
  withScreenshot && p.screenshot ? (await screenshots[`../../brand/screenshots/${p.screenshot}`]?.())?.default : undefined;

const links = [
  p.links.play && { href: p.links.play, label: copy.projects.play },
  p.links.appStore && { href: p.links.appStore, label: copy.projects.appStore },
  p.links.github && { href: p.links.github, label: copy.projects.github },
].filter((l): l is { href: string; label: string } => Boolean(l));
---
<article class="card" data-status={p.status}>
  {shot && <Image src={shot} alt="" width={480} class="shot" />}
  <div class="body">
    <h3>{p.name}</h3>
    <p class="result">{p.result[locale]}</p>
    <p class="summary">{p.summary[locale]}</p>
    <p class="tech mono">{p.tech.join(" · ")}</p>
    <p class="links">
      {links.map((l) => <a href={l.href}>{l.label}</a>)}
    </p>
  </div>
</article>

<style>
  .card {
    display: grid;
    background: var(--surface);
    border: 1px solid var(--line);
    overflow: hidden;
  }
  .shot {
    width: 100%;
    max-height: 18rem;
    object-fit: cover;
    object-position: top;
    filter: saturate(0);
    opacity: 0.85;
  }
  .body {
    padding: var(--space-4);
    display: grid;
    gap: var(--space-2);
  }
  h3 {
    font-size: var(--step-1);
  }
  .result {
    color: var(--bright);
    font-weight: 500;
  }
  .summary,
  .tech {
    color: var(--muted);
  }
  .links {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
</style>
```

Screenshots are desaturated in CSS (`saturate(0)`) so the achromatic system holds without editing the images.

- [ ] **Step 3: Extend `src/views/Home.astro`**

Add to the frontmatter:

```ts
import { getCollection } from "astro:content";
import ProjectCard from "../components/ProjectCard.astro";
import Steps from "../components/Steps.astro";
const projects = (await getCollection("projects")).sort((a, b) => a.data.order - b.data.order);
const orgTech = [...new Set(projects.flatMap((p) => p.data.tech))];
```

After the hero `</section>` insert:

```astro
  <Steps steps={copy.steps} />

  <section class="projects container" aria-labelledby="projects-heading">
    <h2 id="projects-heading">{copy.projects.heading}</h2>
    <p class="lead">{copy.projects.lead}</p>
    <div class="grid">
      {projects.map((p) => <ProjectCard project={p} locale={locale} withScreenshot />)}
    </div>
    <p><a href={pathFor("projects", locale)}>{copy.projects.viewAll} →</a></p>
  </section>

  <section class="build container" aria-labelledby="build-heading">
    <h2 id="build-heading">{copy.build.heading}</h2>
    <p>{copy.build.what}</p>
    <p>{copy.build.how}</p>
    <p class="muted">{copy.build.inOrg} <span class="mono">{orgTech.join(" · ")}</span></p>
  </section>

  <section id="join" class="join container" aria-labelledby="join-heading">
    <h2 id="join-heading">{copy.join.heading}</h2>
    <p class="lead">{copy.join.lead}</p>
    <p>{copy.join.threshold}</p>
    <dl class="facts">
      <dt>{copy.join.discord}</dt><dd><a href={site.discord}>{site.discord.replace("https://", "")}</a></dd>
      <dt>{copy.join.email}</dt><dd><a class="mono" href={`mailto:${site.email}`}>{site.email}</a></dd>
      <dt>{copy.join.room}</dt><dd class="mono">{site.room}, {site.address[0]}</dd>
    </dl>
    <Button href={site.discord}>{copy.hero.ctaDiscord}</Button>
  </section>
```

Add styles:

```css
  .projects,
  .build,
  .join {
    padding-block: var(--space-6);
    display: grid;
    gap: var(--space-4);
  }
  h2 {
    font-size: var(--step-3);
  }
  .grid {
    display: grid;
    gap: var(--space-4);
    grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  }
  .muted {
    color: var(--muted);
  }
  .facts {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: var(--space-2) var(--space-4);
    margin: 0;
  }
  .facts dt {
    color: var(--muted);
  }
  .facts dd {
    margin: 0;
  }
```

- [ ] **Step 4: Verify**

Run: `bun run check && bun run build && bun run preview`
Open `/pl/` and `/en/`: four cards, Kampus and Plan WZIM with screenshots; `Wszystkie projekty →` links to `/pl/projekty/`; `#join` anchor works from the header; at 400 px the cards stack, nothing overflows.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "Add the steps, projects, build and join sections to the home page

Claude-Session: https://claude.ai/code/session_01XnMq4CaXuK3EoJQZAGVBVk"
```

---

### Task 8: Projects page with filter

**Files:**
- Create: `src/components/ProjectFilter.astro`, `src/views/Projects.astro`, `src/pages/pl/projekty.astro`, `src/pages/en/projects.astro`

**Interfaces:**
- Consumes: `ProjectCard` (`data-status`), `copy.projects.filter*`.
- Produces: pages at `/pl/projekty/` and `/en/projects/`.

- [ ] **Step 1: Write `src/components/ProjectFilter.astro`**

```astro
---
import type { Copy } from "../lib/schemas";

interface Props {
  copy: Copy["projects"];
}
const { copy } = Astro.props;
const options = [
  { value: "all", label: copy.filterAll },
  { value: "store", label: copy.filterStore },
  { value: "github", label: copy.filterGithub },
];
---
<div class="filter" role="group" data-project-filter>
  {options.map((o, i) => (
    <button type="button" data-value={o.value} aria-pressed={i === 0 ? "true" : "false"}>{o.label}</button>
  ))}
</div>

<script>
  const root = document.querySelector<HTMLElement>("[data-project-filter]");
  const cards = document.querySelectorAll<HTMLElement>("[data-status]");
  root?.addEventListener("click", (e) => {
    const button = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-value]");
    if (!button) return;
    const value = button.dataset.value;
    for (const b of root.querySelectorAll("button")) b.setAttribute("aria-pressed", String(b === button));
    for (const card of cards) card.hidden = value !== "all" && card.dataset.status !== value;
  });
</script>

<style>
  .filter {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }
  button {
    font: inherit;
    color: var(--muted);
    background: none;
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 0.4em 1em;
    cursor: pointer;
  }
  button[aria-pressed="true"] {
    color: var(--bg);
    background: var(--ink);
    border-color: var(--ink);
  }
</style>
```

- [ ] **Step 2: Write `src/views/Projects.astro`**

```astro
---
import { getCollection, getEntry } from "astro:content";
import ProjectCard from "../components/ProjectCard.astro";
import ProjectFilter from "../components/ProjectFilter.astro";
import Base from "../layouts/Base.astro";
import type { Locale } from "../lib/i18n";

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const copy = (await getEntry("copy", locale))!.data;
const projects = (await getCollection("projects")).sort((a, b) => a.data.order - b.data.order);
---
<Base locale={locale} route="projects" title={`${copy.projects.heading} — Silver`} description={copy.projects.lead}>
  <section class="container page">
    <h1>{copy.projects.heading}</h1>
    <p class="lead">{copy.projects.lead}</p>
    <ProjectFilter copy={copy.projects} />
    <div class="grid">
      {projects.map((p) => <ProjectCard project={p} locale={locale} withScreenshot />)}
    </div>
  </section>
</Base>

<style>
  .page {
    padding-block: var(--space-6);
    display: grid;
    gap: var(--space-4);
  }
  h1 {
    font-size: var(--step-4);
  }
  .lead {
    color: var(--muted);
    font-size: var(--step-1);
  }
  .grid {
    display: grid;
    gap: var(--space-4);
    grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  }
</style>
```

- [ ] **Step 3: Write the pages**

`src/pages/pl/projekty.astro`:

```astro
---
import Projects from "../../views/Projects.astro";
---
<Projects locale="pl" />
```

`src/pages/en/projects.astro`: same with `locale="en"`.

- [ ] **Step 4: Verify**

Run: `bun run check && bun run build && bun run preview`
On `/pl/projekty/`: clicking „W sklepach" hides Dni SGGW and Charmander; „Na GitHubie" hides the two store apps; „Wszystkie" shows all four; the pressed button is filled. Locale switch lands on `/en/projects/`. `dist/` client JS for this page is under 2 KB (check the file size under `dist/_astro/`).

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "Add the projects page with a store/GitHub filter

Claude-Session: https://claude.ai/code/session_01XnMq4CaXuK3EoJQZAGVBVk"
```

---

### Task 9: History page

**Files:**
- Create: `src/components/Timeline.astro`, `src/views/History.astro`, `src/pages/pl/historia.astro`, `src/pages/en/history.astro`

**Interfaces:**
- Consumes: collection `history`, `historyStart` (Task 2), `copy.history`.

- [ ] **Step 1: Write `src/components/Timeline.astro`**

```astro
---
import type { CollectionEntry } from "astro:content";
import type { Locale } from "../lib/i18n";
import { historyStart } from "../lib/schemas";

interface Props {
  entries: CollectionEntry<"history">[];
  locale: Locale;
}
const { entries, locale } = Astro.props;
const sorted = [...entries].sort(
  (a, b) => historyStart(a.data) - historyStart(b.data) || a.data.order - b.data.order,
);
const label = (d: CollectionEntry<"history">["data"]) =>
  "year" in d ? String(d.year) : `${d.yearFrom}–${d.yearTo}`;
---
<ol class="timeline">
  {sorted.map((e) => (
    <li>
      <span class="year mono">{label(e.data)}</span>
      <div>
        <h2>{e.data.title[locale]}</h2>
        <p>{e.data.body[locale]}</p>
      </div>
    </li>
  ))}
</ol>

<style>
  .timeline {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--space-5);
  }
  li {
    display: grid;
    grid-template-columns: 7rem 1fr;
    gap: var(--space-4);
    align-items: start;
  }
  .year {
    color: var(--muted);
    padding-top: 0.35em;
  }
  div {
    display: grid;
    gap: var(--space-2);
    padding-bottom: var(--space-5);
    border-bottom: 1px solid var(--line);
  }
  h2 {
    font-size: var(--step-1);
  }
  p {
    color: var(--muted);
  }
  @media (max-width: 40rem) {
    li {
      grid-template-columns: 1fr;
      gap: var(--space-2);
    }
  }
</style>
```

- [ ] **Step 2: Write `src/views/History.astro`**

```astro
---
import { getCollection, getEntry } from "astro:content";
import Timeline from "../components/Timeline.astro";
import Base from "../layouts/Base.astro";
import type { Locale } from "../lib/i18n";

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const copy = (await getEntry("copy", locale))!.data;
const entries = await getCollection("history");
---
<Base locale={locale} route="history" title={`${copy.history.heading} — Silver`} description={copy.history.lead}>
  <section class="container page">
    <h1>{copy.history.heading}</h1>
    <p class="lead">{copy.history.lead}</p>
    <Timeline entries={entries} locale={locale} />
  </section>
</Base>

<style>
  .page {
    padding-block: var(--space-6);
    display: grid;
    gap: var(--space-5);
  }
  h1 {
    font-size: var(--step-4);
  }
  .lead {
    color: var(--muted);
    font-size: var(--step-1);
  }
</style>
```

- [ ] **Step 3: Write the pages**

`src/pages/pl/historia.astro`:

```astro
---
import History from "../../views/History.astro";
---
<History locale="pl" />
```

`src/pages/en/history.astro`: same with `locale="en"`.

- [ ] **Step 4: Verify**

Run: `bun run check && bun run build && bun run preview`
On `/pl/historia/`: 11 entries in order 2013, 2013, 2014, 2014–2015, 2015, 2016–2018, 2018, 2019, 2021–2022, 2023, 2026. No links inside entries (`grep -c 'href' dist/pl/historia/index.html` counts only header/footer links — compare with `dist/pl/projekty/index.html` minus the card links). The footer's „od 2013" link now resolves.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "Add the history timeline page

Claude-Session: https://claude.ai/code/session_01XnMq4CaXuK3EoJQZAGVBVk"
```

---

### Task 10: Foil follows the pointer

**Files:**
- Modify: `src/components/Mark.astro`

**Interfaces:**
- Consumes: the exported SVG's `<pattern id="foil" … x="…" y="…">` attributes (the configurator writes `x`/`y` on the pattern).

- [ ] **Step 1: Add the script to `Mark.astro`**

Append after the `<style>` block:

```astro
<script>
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  if (!reduce && fine) {
    for (const mark of document.querySelectorAll<HTMLElement>("[data-foil]")) {
      const pattern = mark.querySelector<SVGPatternElement>("pattern");
      if (!pattern) continue;
      const x0 = Number(pattern.getAttribute("x") ?? 0);
      const y0 = Number(pattern.getAttribute("y") ?? 0);
      const w = Number(pattern.getAttribute("width") ?? 0);
      const h = Number(pattern.getAttribute("height") ?? 0);
      const range = 0.04;
      let raf = 0;
      let dx = 0;
      let dy = 0;
      const apply = () => {
        raf = 0;
        pattern.setAttribute("x", String(x0 + dx * w * range));
        pattern.setAttribute("y", String(y0 + dy * h * range));
      };
      mark.addEventListener("pointermove", (e) => {
        const r = mark.getBoundingClientRect();
        dx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        dy = ((e.clientY - r.top) / r.height - 0.5) * 2;
        if (!raf) raf = requestAnimationFrame(apply);
      });
      mark.addEventListener("pointerleave", () => {
        dx = 0;
        dy = 0;
        if (!raf) raf = requestAnimationFrame(apply);
      });
    }
  }
</script>
```

Add `.mark :global(pattern) { transition: none; }` is unnecessary — attribute changes are not animated; leave styles as they are.

- [ ] **Step 2: Verify**

Run: `bun run build && bun run preview`
On `/pl/`, move the pointer across the hero mark: the texture shifts by a few percent and returns on leave. In DevTools → Rendering → emulate `prefers-reduced-motion: reduce`, reload: no movement. On a touch emulation (`pointer: coarse`), no movement. Total JS on `/pl/` < 3 KB.

- [ ] **Step 3: Commit**

```bash
git add src/components/Mark.astro
git commit -m "Let the foil in the hero mark follow the pointer

Claude-Session: https://claude.ai/code/session_01XnMq4CaXuK3EoJQZAGVBVk"
```

---

### Task 11: Brochure pages

**Files:**
- Create: `src/layouts/Brochure.astro`, `src/components/Qr.astro`, `src/views/BrochureStudents.astro`, `src/views/BrochureCompanies.astro`, `src/pages/pl/broszura/studenci.astro`, `src/pages/pl/broszura/firmy.astro`, `src/pages/en/brochure/students.astro`, `src/pages/en/brochure/companies.astro`

**Interfaces:**
- Produces: four routes, each rendering one `<div class="page">` of exactly 1240×1754 CSS px, `noindex`, no header/footer.
- `Qr.astro` props `{ value: string; size?: number }` → inline SVG.

- [ ] **Step 1: Write `src/components/Qr.astro`**

```astro
---
import QRCode from "qrcode";

interface Props {
  value: string;
  size?: number;
}
const { value, size = 260 } = Astro.props;
const svg = await QRCode.toString(value, {
  type: "svg",
  margin: 0,
  errorCorrectionLevel: "M",
  color: { dark: "#D8DBDE", light: "#00000000" },
});
---
<span class="qr" style={`--qr:${size}px`} set:html={svg} role="img" aria-label={value} />

<style>
  .qr {
    display: block;
    inline-size: var(--qr);
  }
  .qr :global(svg) {
    inline-size: 100%;
    block-size: auto;
  }
</style>
```

- [ ] **Step 2: Write `src/layouts/Brochure.astro`**

```astro
---
import type { Locale } from "../lib/i18n";
import "../styles/tokens.css";
import "../styles/base.css";

interface Props {
  locale: Locale;
  title: string;
}
const { locale, title } = Astro.props;
---
<!doctype html>
<html lang={locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=1240" />
    <meta name="robots" content="noindex, nofollow" />
    <title>{title}</title>
  </head>
  <body>
    <div class="page">
      <slot />
    </div>
  </body>
</html>

<style is:global>
  html {
    font-size: 22px;
  }
  body {
    min-height: 0;
    background: var(--bg);
  }
  .page {
    position: relative;
    isolation: isolate;
    width: 1240px;
    height: 1754px;
    overflow: hidden;
    padding: 96px;
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 48px;
  }
  .page h1 {
    font-size: 64px;
    max-width: 16ch;
  }
  .page h2 {
    font-size: 30px;
    margin-bottom: 16px;
  }
  .page p {
    max-width: none;
  }
  .page .muted {
    color: var(--muted);
  }
  .page .band {
    position: absolute;
    inset: auto 0 0 0;
    height: 420px;
    z-index: -1;
    background: url("/brand/foil-texture.jpg") center / cover;
    opacity: 0.08;
    clip-path: polygon(0 100%, 100% calc(100% - 1240px * tan(var(--angle))), 100% 100%);
  }
</style>
```

- [ ] **Step 3: Write `src/views/BrochureStudents.astro`**

```astro
---
import { getCollection, getEntry } from "astro:content";
import Mark from "../components/Mark.astro";
import Qr from "../components/Qr.astro";
import Brochure from "../layouts/Brochure.astro";
import type { Locale } from "../lib/i18n";

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const copy = (await getEntry("copy", locale))!.data;
const site = (await getEntry("site", "site"))!.data;
const b = copy.brochure.students;
const apps = (await getCollection("projects"))
  .filter((p) => p.data.status === "store")
  .sort((a, c) => a.data.order - c.data.order);
---
<Brochure locale={locale} title={b.title}>
  <div class="band" aria-hidden="true"></div>
  <header class="top">
    <Mark size="220px" />
    <div>
      <h1>{b.title}</h1>
      <p class="lead muted">{b.lead}</p>
    </div>
  </header>

  <div class="body">
    <section>
      <h2>{b.stepsHeading}</h2>
      <ol class="steps">
        {copy.steps.items.map((s, i) => (
          <li>
            <span class="mono muted">0{i + 1}</span>
            <strong>{s.title}</strong>
            <span class="muted">{s.body}</span>
          </li>
        ))}
      </ol>
    </section>
    <section>
      <h2>{b.appsHeading}</h2>
      <ul class="apps">
        {apps.map((p) => (
          <li>
            <strong>{p.data.name}</strong>
            <span class="muted">{p.data.summary[locale]}</span>
            <span class="mono">{p.data.result[locale]}</span>
          </li>
        ))}
      </ul>
    </section>
    <p class="threshold">{b.threshold}</p>
  </div>

  <footer class="bottom">
    <div class="contact">
      <p class="mono">{site.discord.replace("https://", "")}</p>
      <p class="mono muted">{site.email}</p>
      <p class="mono muted">{copy.join.room} {site.room}, {site.address[0]}</p>
    </div>
    <div class="qr">
      <Qr value={site.discord} size={240} />
      <p class="muted">{b.qrLabel}</p>
    </div>
  </footer>
</Brochure>

<style>
  .top {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 48px;
    align-items: center;
  }
  .lead {
    font-size: 30px;
    margin-top: 16px;
  }
  .body {
    display: grid;
    gap: 40px;
    align-content: start;
  }
  .steps,
  .apps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 20px;
  }
  .steps li,
  .apps li {
    display: grid;
    gap: 6px;
    padding: 24px;
    background: var(--surface);
    border: 1px solid var(--line);
  }
  .steps {
    grid-template-columns: repeat(3, 1fr);
  }
  .apps {
    grid-template-columns: repeat(2, 1fr);
  }
  .threshold {
    font-size: 30px;
    font-weight: 500;
  }
  .bottom {
    display: grid;
    grid-template-columns: 1fr 240px;
    gap: 48px;
    align-items: end;
  }
  .qr p {
    margin-top: 12px;
    font-size: 18px;
  }
</style>
```

- [ ] **Step 4: Write `src/views/BrochureCompanies.astro`**

```astro
---
import { getCollection, getEntry } from "astro:content";
import Mark from "../components/Mark.astro";
import Qr from "../components/Qr.astro";
import Brochure from "../layouts/Brochure.astro";
import type { Locale } from "../lib/i18n";

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const copy = (await getEntry("copy", locale))!.data;
const site = (await getEntry("site", "site"))!.data;
const b = copy.brochure.companies;
const projects = (await getCollection("projects")).sort((a, c) => a.data.order - c.data.order);
---
<Brochure locale={locale} title={b.title}>
  <div class="band" aria-hidden="true"></div>
  <header class="top">
    <Mark size="180px" />
    <div>
      <h1>{b.title}</h1>
      <p class="lead muted">{b.lead}</p>
    </div>
  </header>

  <div class="body">
    <section>
      <h2>{b.whoHeading}</h2>
      <p>{b.who}</p>
    </section>
    <section>
      <h2>{b.builtHeading}</h2>
      <ul class="built">
        {projects.map((p) => (
          <li>
            <strong>{p.data.name}</strong>
            <span class="mono">{p.data.result[locale]}</span>
            <span class="muted">{p.data.tech.join(" · ")}</span>
          </li>
        ))}
      </ul>
    </section>
    <section>
      <h2>{b.togetherHeading}</h2>
      <ol class="together">
        {b.together.map((t) => <li>{t}</li>)}
      </ol>
    </section>
  </div>

  <footer class="bottom">
    <div>
      <h2>{b.contactHeading}</h2>
      <p>{site.chair}</p>
      <p class="mono">{site.email}</p>
      <p class="mono muted">{site.faculty[locale]}, {site.university}</p>
      <p class="mono muted">{site.address.join(", ")}</p>
    </div>
    <div class="qr">
      <Qr value={`mailto:${site.email}`} size={220} />
      <p class="muted">{b.qrLabel}</p>
    </div>
  </footer>
</Brochure>

<style>
  .top {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 48px;
    align-items: center;
  }
  .lead {
    font-size: 30px;
    margin-top: 16px;
  }
  .body {
    display: grid;
    gap: 40px;
    align-content: start;
  }
  .built {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  .built li {
    display: grid;
    gap: 6px;
    padding: 24px;
    background: var(--surface);
    border: 1px solid var(--line);
  }
  .together {
    margin: 0;
    padding-left: 1.2em;
    display: grid;
    gap: 12px;
  }
  .bottom {
    display: grid;
    grid-template-columns: 1fr 220px;
    gap: 48px;
    align-items: end;
  }
  .qr p {
    margin-top: 12px;
    font-size: 18px;
  }
</style>
```

- [ ] **Step 5: Write the four pages**

`src/pages/pl/broszura/studenci.astro`:

```astro
---
import BrochureStudents from "../../../views/BrochureStudents.astro";
---
<BrochureStudents locale="pl" />
```

`src/pages/pl/broszura/firmy.astro` → `BrochureCompanies locale="pl"`; `src/pages/en/brochure/students.astro` → `BrochureStudents locale="en"`; `src/pages/en/brochure/companies.astro` → `BrochureCompanies locale="en"`.

- [ ] **Step 6: Verify in the browser**

Run: `bun run check && bun run build && bun run preview`
Open each of the four routes with the window wider than 1240 px. Expect: a 1240×1754 dark page, no scrollbar inside `.page`, QR scannable with a phone (students → Discord invite; companies → mail composer). Adjust font sizes in the two views only if text overflows the page; the layout must not scroll.

- [ ] **Step 7: Commit**

```bash
git add src
git commit -m "Add the A4 brochure routes for students and companies

Claude-Session: https://claude.ai/code/session_01XnMq4CaXuK3EoJQZAGVBVk"
```

---

### Task 12: Brochure renderer

**Files:**
- Create: `scripts/png-size.ts`, `scripts/render-brochures.ts`
- Test: `tests/png-size.test.ts`

**Interfaces:**
- Produces: `pngSize(buf: Uint8Array): { width: number; height: number }` (throws on a non-PNG); `bun run brochure` writes `dist/brochure/silver-{studenci-pl,firmy-pl,students-en,companies-en}.png`, exits 1 on wrong size or overflow.

- [ ] **Step 1: Write the failing test**

`tests/png-size.test.ts`:

```ts
import { expect, test } from "bun:test";
import { pngSize } from "../scripts/png-size";

const png = (w: number, h: number) => {
  const b = new Uint8Array(24);
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  new DataView(b.buffer).setUint32(16, w);
  new DataView(b.buffer).setUint32(20, h);
  return b;
};

test("reads width and height from IHDR", () => {
  expect(pngSize(png(2480, 3508))).toEqual({ width: 2480, height: 3508 });
});

test("rejects non-PNG bytes", () => {
  expect(() => pngSize(new Uint8Array(24))).toThrow("not a PNG");
});
```

- [ ] **Step 2: Run to see it fail**

Run: `bun test tests/png-size.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `scripts/png-size.ts`**

```ts
const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export const pngSize = (buf: Uint8Array): { width: number; height: number } => {
  if (buf.length < 24 || signature.some((b, i) => buf[i] !== b)) throw new Error("not a PNG");
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
};
```

- [ ] **Step 4: Run the test**

Run: `bun test tests/png-size.test.ts`
Expected: PASS.

- [ ] **Step 5: Write `scripts/render-brochures.ts`**

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { pngSize } from "./png-size";

const WIDTH = 1240;
const HEIGHT = 1754;
const SCALE = 2;

const root = resolve(import.meta.dir, "..");
const dist = join(root, "dist");
const out = join(dist, "brochure");
mkdirSync(out, { recursive: true });

const jobs = [
  { path: "/pl/broszura/studenci/", file: "silver-studenci-pl.png" },
  { path: "/pl/broszura/firmy/", file: "silver-firmy-pl.png" },
  { path: "/en/brochure/students/", file: "silver-students-en.png" },
  { path: "/en/brochure/companies/", file: "silver-companies-en.png" },
];

const server = Bun.serve({
  port: 0,
  fetch: async (req) => {
    const url = new URL(req.url);
    const path = url.pathname.endsWith("/") ? `${url.pathname}index.html` : url.pathname;
    const file = Bun.file(join(dist, path));
    return (await file.exists()) ? new Response(file) : new Response("not found", { status: 404 });
  },
});

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: SCALE });

let failed = false;
for (const job of jobs) {
  await page.goto(`http://localhost:${server.port}${job.path}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(() => {
    const el = document.querySelector(".page")!;
    return { x: el.scrollWidth - el.clientWidth, y: el.scrollHeight - el.clientHeight };
  });
  if (overflow.x > 0 || overflow.y > 0) {
    console.error(`${job.path}: content overflows the page by ${overflow.x}×${overflow.y} px`);
    failed = true;
  }
  const png = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
  const size = pngSize(png);
  if (size.width !== WIDTH * SCALE || size.height !== HEIGHT * SCALE) {
    console.error(`${job.file}: got ${size.width}×${size.height}`);
    failed = true;
  }
  writeFileSync(join(out, job.file), png);
  console.log(`${job.file} ${size.width}×${size.height}`);
}

await browser.close();
server.stop();
process.exit(failed ? 1 : 0);
```

- [ ] **Step 6: Run it**

Run: `bun run build && bun run brochure`
Expected: four lines `… 2480×3508`, exit code 0, files in `dist/brochure/`. Open each PNG: readable text, QR intact, nothing clipped. Then `mise run brochure` does the same via the task dependency.

- [ ] **Step 7: Commit**

```bash
git add scripts tests/png-size.test.ts
git commit -m "Render the four brochures to 300 DPI PNGs with Playwright

Claude-Session: https://claude.ai/code/session_01XnMq4CaXuK3EoJQZAGVBVk"
```

---

### Task 13: CI, deploy, README

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`

- [ ] **Step 1: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: jdx/mise-action@v3
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun run fmt:check
      - run: bun run check
      - run: bun test
      - run: bun run build
      - run: bunx playwright install --with-deps chromium
      - run: bun run brochure
      - uses: actions/upload-artifact@v4
        with:
          name: brochures
          path: dist/brochure
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Check the current major versions of `actions/checkout`, `jdx/mise-action`, `actions/upload-artifact`, `actions/upload-pages-artifact`, `actions/deploy-pages` on GitHub before committing and use the latest majors.

- [ ] **Step 2: Write `README.md`**

```markdown
# Silver — strona i broszury

Statyczna strona koła (PL/EN) i cztery broszury A4 renderowane z tej samej treści.

## Wymagania

[mise](https://mise.jdx.dev) — instaluje Buna w wersji z `mise.toml`.

## Komendy

| Komenda | Co robi |
|---|---|
| `mise run dev` | serwer deweloperski |
| `mise run check` | `astro check` — typy w `.ts` i `.astro` |
| `mise run lint` / `mise run fmt` | oxlint / oxfmt |
| `mise run test` | testy treści, tras i parsera PNG |
| `mise run build` | statyczny build do `dist/` |
| `mise run brochure` | build + cztery PNG 2480×3508 do `dist/brochure/` |
| `mise run logo:export` | eksport logo z `logo-configurator.html` do `brand/logo/` |

Pierwsze uruchomienie Playwrighta: `bunx playwright install chromium`.

## Treść

Wszystko, co widać na stronie i w broszurach, jest w `src/content/`:

- `site.json` — kontakt, sala, linki, rok
- `copy/pl.json`, `copy/en.json` — teksty; oba pliki muszą mieć te same klucze
- `projects/*.json` — karty projektów
- `history/*.json` — wpisy osi czasu

Schematy w `src/lib/schemas.ts`; `mise run test` sprawdza każdą zmianę.
```

- [ ] **Step 3: Verify locally**

Run: `bun run lint && bun run fmt:check && bun run check && bun test && bun run build && bun run brochure`
Expected: everything green, same sequence CI runs.

- [ ] **Step 4: Commit**

```bash
git add .github README.md
git commit -m "Add CI with GitHub Pages deploy and a README

Claude-Session: https://claude.ai/code/session_01XnMq4CaXuK3EoJQZAGVBVk"
```

---

### Task 14: Final verification pass

**Files:** none new; fixes land in the files they belong to.

- [ ] **Step 1: Lighthouse on both locales**

Run: `bun run build && bun run preview &` then
`bunx lighthouse http://localhost:4321/pl/ --only-categories=performance,accessibility --chrome-flags="--headless=new" --output=json --output-path=/tmp/lh-pl.json` and the same for `/en/`, `/pl/projekty/`, `/pl/historia/`.
Expected: Performance ≥ 95, Accessibility ≥ 95 on each. If Lighthouse cannot find Chrome, set `CHROME_PATH` to the Playwright chromium binary (`ls ~/.cache/ms-playwright/chromium-*/chrome-linux/chrome`).

- [ ] **Step 2: Manual checks at 400 px and 1440 px**

For `/pl/`, `/en/`, `/pl/projekty/`, `/pl/historia/`: no horizontal scroll, header wraps cleanly, cards stack, timeline collapses to one column, focus rings visible when tabbing, locale switch preserves the page.

- [ ] **Step 3: Copy audit against the spec**

`grep -riE "reaktyw|misj|pasj|innowacyj|wayback|archive\.org" dist/ --include=*.html` → no matches.
`grep -c "silver.sggw.pl" dist/pl/index.html` → only the email.

- [ ] **Step 4: Bundle size**

`du -ch dist/_astro/*.js | tail -1` → under 20 KB total.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A src
git commit -m "Fix issues found in the final verification pass

Claude-Session: https://claude.ai/code/session_01XnMq4CaXuK3EoJQZAGVBVk"
```

(Only if there were fixes.)
