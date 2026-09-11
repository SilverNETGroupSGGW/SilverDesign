# Handoff — Silver site and brochures

Stan na 2026-09-11, branch `site` (od `main` @ `1c24bb6`). Ten plik jest po to, żeby świeża sesja (w tym w chmurze, bez historii rozmowy) mogła wznowić pracę bez zgadywania.

## Gdzie jesteśmy

- **Spec (autorytet):** `docs/superpowers/specs/2026-09-11-silver-site-and-brochure-design.md`
- **Plan (14 zadań, pełny kod w każdym):** `docs/superpowers/plans/2026-09-11-silver-site-and-brochure.md`
- **Zrobione:** zadanie 1/14 — scaffold (Astro 7.3, TS 6, Bun 1.4 przez mise, oxlint, oxfmt, `/` → `/pl/`). Commity `e0595dc`, `8a04944`. Review przeszedł, working tree czysty.
- **Następne:** zadanie 2 — schematy Zod, `site.json`, 4 projekty, 11 wpisów historii, testy.

## Jak wznowić

1. `mise install && bun install` (Playwright jest w devDependencies, ale **Chromium nie jest pobrany** — `bunx playwright install chromium` przed zadaniem 5).
2. Odpal skill `superpowers:subagent-driven-development` z argumentem: ścieżka planu.
3. Skill szuka workspace `.superpowers/sdd/2026-09-11-silver-site-and-brochure/` — jest git-ignored, więc w nowym środowisku go nie ma. Odtwórz ledger z sekcji poniżej (pierwsza linia musi brzmieć dokładnie `# SDD ledger — plan: docs/superpowers/plans/2026-09-11-silver-site-and-brochure.md`), wpisz `Task 1: complete`, i zacznij od zadania 2.
4. Briefy generuje skrypt skilla: `scripts/task-brief <plan> <N>`.

## Twarde wymagania użytkownika (nie z plików)

- **Modele subagentów: `opus` dla implementerów i reviewerów, `sonnet` dla scoped re-review małych diffów. Nigdy `fable`.**
- Jeden implementer naraz (zadania piszą do wspólnych plików).
- Odpowiedzi po polsku, krótko, akcja na początku (użytkownik ma ADHD — tryb `i-have-adhd` był włączony przez hook).
- Komentarze w kodzie tylko load-bearing (`shut-up-and-code` był włączony przez hook).
- Użytkownik prosił o zatrzymanie po zadaniu 1 — kolejne zadania lecą bez przerw, chyba że powie inaczej.
- Grilling / brainstorming już zrobione — nie wracać do pytań o zakres.

## Rulings podjęte do tej pory (do cofnięcia, jeśli złe)

| Ruling | Dlaczego | Koszt, jeśli złe |
|---|---|---|
| Branch `site` zamiast worktree | sesja skonfigurowana do pracy w miejscu | żaden |
| `tsconfig` `types: ["astro/client", "bun-types"]` | plan miał tylko `bun-types`, to gubi typy Astro | jedna linia |
| `$schema` w `.oxlintrc.json` / `.oxfmtrc.json` zostaje (pliki istnieją w node_modules) | — | żaden |
| oxfmt ignoruje `docs/superpowers` | inaczej przepisuje tabele w specu i planie przy każdej edycji | jedna linia |
| `bun test` bez `--pass-with-no-tests` | zadanie 2 dodaje pierwsze testy, CI dopiero w 13 | jedna flaga |
| Task 12: `document.fonts.ready.then(() => undefined)` w `page.evaluate` | FontFaceSet nie jest serializowalny | jedna linia |

## Odłożone drobiazgi (dla końcowego review)

- `astro.config.ts` nie jest objęty `tsconfig.include` (plan tak każe).
- `mise.toml` nie ma zadań `fmt:check` i `preview` (plan tak każe; skrypty w `package.json` są).

## Ledger do odtworzenia

```
# SDD ledger — plan: docs/superpowers/plans/2026-09-11-silver-site-and-brochure.md
Spec: docs/superpowers/specs/2026-09-11-silver-site-and-brochure-design.md
Branch: site. Models: implementers/reviewers opus, scoped re-reviews sonnet. Never fable.
Pre-flight scan: clean except the rulings listed in HANDOFF.md (T1 tsconfig types, T1 $schema, T12 fonts.ready).
Task 1: complete (commits 1c24bb6..8a04944, review clean)
Task 1: minor (deferred): astro.config.ts not covered by tsconfig include
Task 1: minor (deferred): mise.toml lacks fmt:check/preview tasks
```

## Fakty o kole, których nie ma nigdzie indziej

Wszystkie są w spec §3 i §4.3. Źródła (Wayback, Google Play, GitHub org) w spec §3.1. Prezentacja `Silver_NET_Dni_SGGW (1).pptx` z Downloads została już przerobiona — zrzuty ekranu są w `brand/screenshots/`, reszta odrzucona.
