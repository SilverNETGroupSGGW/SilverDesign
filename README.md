# Silver — strona i broszury

Statyczna strona koła (PL/EN) i cztery broszury A4 renderowane z tej samej treści.

## Wymagania

[mise](https://mise.jdx.dev) — instaluje Buna w wersji z `mise.toml`.

## Komendy

| Komenda                          | Co robi                                                  |
| -------------------------------- | -------------------------------------------------------- |
| `mise run dev`                   | serwer deweloperski                                      |
| `mise run check`                 | `astro check` — typy w `.ts` i `.astro`                  |
| `mise run lint` / `mise run fmt` | oxlint / oxfmt                                           |
| `mise run test`                  | testy treści, tras i parsera PNG                         |
| `mise run build`                 | statyczny build do `dist/`                               |
| `mise run brochure`              | build + cztery PNG 2480×3508 do `dist/brochure/`         |
| `mise run logo:export`           | eksport logo z `logo-configurator.html` do `brand/logo/` |

Pierwsze uruchomienie Playwrighta: `bunx playwright install chromium`.

## Treść

Wszystko, co widać na stronie i w broszurach, jest w `src/content/`:

- `site.json` — kontakt, sala, linki, rok
- `copy/pl.json`, `copy/en.json` — teksty; oba pliki muszą mieć te same klucze
- `projects/*.json` — karty projektów
- `history/*.json` — wpisy osi czasu

Schematy w `src/lib/schemas.ts`; `mise run test` sprawdza każdą zmianę.

## Deploy

`.github/workflows/deploy.yml` uruchamia lint, `fmt:check`, `check`, testy, build i render
broszur; z gałęzi `main` publikuje `dist/` na GitHub Pages, a broszury zostają jako artefakt
buildu. Render broszur wymaga Chromium — lokalnie `bunx playwright install chromium`, w CI
robi to krok `bunx playwright install --with-deps chromium`. `site` w `astro.config.ts` to
`https://silvernetgroupsggw.github.io`, a repozytorium nazywa się `SilverDesign`, więc Pages
serwowałoby je pod `/SilverDesign/` — strona używa ścieżek od korzenia, więc musi stać na
własnej domenie (`silver.sggw.pl`) albo w repozytorium user-site; inaczej trzeba zmienić
`site` i `base`.
