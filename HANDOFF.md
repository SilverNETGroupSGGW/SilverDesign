# Handoff — Silver site and brochures

Stan na 2026-09-11 (późny wieczór), branch `site` (merge-base z `main`: `acdacd2`). Ten plik jest po to, żeby świeża sesja mogła wznowić pracę bez zgadywania.

## Gdzie jesteśmy

- **Spec (autorytet):** `docs/superpowers/specs/2026-09-11-silver-site-and-brochure-design.md`
- **Plan (14 zadań):** `docs/superpowers/plans/2026-09-11-silver-site-and-brochure.md`
- **Zrobione:** wszystkie 14 zadań + końcowy review całej gałęzi + fala poprawek; potem Impeccable audit/critique i trzy partie poprawek (sekcja niżej). Każde zadanie przeszło review (spec + jakość); Important-y naprawione w rundach poprawek, minory odłożone (lista poniżej).
- **Bramki (na `0349710`):** `oxlint` 0 ostrzeżeń, `oxfmt --check` czysto, `astro check` 0/0/0, `bun test` 20/20, `astro build` 12 stron, `bun run brochure` 4× 2480×3508, Lighthouse mobile 97–100 / 100, detektor Impeccable `[]`.
- **Nie zrobione:** push, PR, włączenie Pages. Gałąź `site` czeka na decyzję o integracji.

## Impeccable — audit, critique i trzy partie poprawek (2026-09-11, po południu)

Po zamknięciu planu odpalono `impeccable audit` (14/20) i `impeccable critique` (19/32) w osobnych subagentach; raporty w historii sesji. Właściciel: „napraw wszystko, mocniej, w granicach §8, kopia otwarta w ramach §2". Trzy partie (jeden implementer naraz, review + scoped re-review każdej):

1. **harden/optimize** (`fc02f0b`…`500b3c3`): reflow przy 200 % zoomu; `public/brand/foil-texture.jpg` i cropy zrzutów jako **pochodne** generowane przez `bun run assets:derive` (`scripts/derive-assets.ts`; mastery w `brand/` nietknięte); ścieżka logo emitowana raz na dokument (`MarkDefs.astro` + `<use>`); filtr projektów z live region, nazwą grupy i stanem w URL (`?filtr=` / `?filter=`); glob zrzutów zawężony; fonty **subsetowane** do latin + latin-ext (`subset-font`, 141→80 KB); strona 404 (dwujęzyczna); OG/Twitter meta + `public/og.png` z `export-logo.ts`; `--line-interactive` (3.5:1) na kontrolkach; cele dotyku ≥ 32 px; `plan-wzim-day-crop.png` bez nazwiska.
2. **mocniej + konwersja** (`60b7f64`…`828f84a`): hero = pas folii (dwie strefy, kąt dokładny z konstrukcji `height = width × tan`, CTA na 466 px przy 1440×900); kąt jako marker `h2`, cięcie kart/przycisku/stopki/pigułek filtra; `JoinStrip` na `/projekty` i `/historia`; siatka 2×2; powierzchnie przeglądarki (selection, caret, scrollbar); test ogranicza długość `hero.title` (38 znaków) jako strażnik podłogi `42rem` hero.
3. **broszury** (`89b1787`…`0349710`): pas jako grunt dolnej połowy, QR na płycie `--bg` (strefa ciszy 40 px, moduły na całych pikselach: studenci 250/25, firmy 203/29), wordmark „Silver", skala druku w `Brochure.astro`, wspólny `.cut` w `base.css` zamiast dziewięciu kopii wielokąta.

Lighthouse mobile na końcu: `/pl/` 97/100, `/en/` 98/100, `/pl/projekty/` 98/100, `/pl/historia/` 100/100. Detektor: `[]` (Geist/Geist Mono wpisane jako wyjątek w `.impeccable/config.json` z powołaniem na §8).

### Rulingi z tej fazy (do cofnięcia, jeśli złe)

| Ruling | Dlaczego | Koszt, jeśli złe |
|---|---|---|
| Pochodne assety (tekstura q85, cropy, subsety fontów, favicon, og.png) generowane skryptem, mastery nietknięte | odtwarzalność; właściciel marki nie traci źródeł | skrypt + commit wyników |
| `plan-wzim-day.png` przycięty nad linią z nazwiskiem; `plan-wzim-list.png` nieużywany (dwa nazwiska) | §2.7 / prywatność | inny zrzut |
| Ghost button zachowuje ramkę `--ink` (nie `--line-interactive`) | nowy token = regres kontrastu | jedna linia |
| Stopka: cięcie o biegu 6rem + linia `--line` po skosie zamiast pełnej diagonali | pełna diagonala 26,17° na 1440 px = 707 px wysokości | kilka linii CSS |
| Pigułki filtra kwadratowe; wciśnięta z cięciem jak przycisk | jedyne zaokrąglenie w systemie | jedna reguła |
| `hero.title` ≤ 38 znaków (test) jako strażnik podłogi `42rem` | jedna linia tytułu więcej kładzie `--muted` na folię | zmiana stałej + testu |
| `.lead { max-width: 60ch }` | lead na `/projekty` miał 93 znaki w linii | jedna linia |
| Nagłówki `h2` broszur przecinają pas (atrament na folii ≥ 4,77:1) zamiast siedzieć na płycie | kontrakt kierunku dawał podłogę 4,5:1; reviewer uznał to za lepszy ruch | płyta pod h2 |
| Pas w broszurze firm 40 px niżej niż u studentów (`--band-left: 1140`) | marker h2 „razem" kolidował z krawędzią pasa | jedna wartość |
| Wyniki projektów z orga (zdania) w Geist, tylko liczby pobrań w Mono | §8 | warunek w widoku |
| Adres na arkuszach EN zostaje w formie lokalnej („ul.", „budynek") | adres pocztowy | `LocalizedString` w `site.json` |

### Otwarte dla właściciela

- QR jasne-na-ciemnym: jeden fizyczny skan przed drukiem (niektóre skanery laserowe odmawiają inwersji); realny zasięg ~40 cm przy 34–42 mm.
- Adres EN mieszany językowo (patrz ruling).
- Podłoga `42rem` hero jest empiryczna; `hero.lead` nie ma strażnika (68–124 px marginesu).
- `--cut` skaluje się per element z konwencji, nie z mechanizmu.
- 39 % wierzchołków ścieżki logo poza viewBox — do poprawki w eksporterze, nie w renderze.

## Do decyzji właściciela (przed deployem)

1. **Ścieżka bazowa Pages.** `astro.config.ts` ma `site: https://silvernetgroupsggw.github.io`, a repo nazywa się `SilverDesign` — project Pages serwuje pod `/SilverDesign/`, a strona używa ścieżek od korzenia (`/pl/`, `/fonts/`, `/brand/`). Trzeba: własna domena (`silver.sggw.pl`, `public/CNAME`) albo repo user-site, albo zmiana `site`/`base` (inwazyjna: `pathFor` + URL-e assetów). Do tego Pages → Source: „GitHub Actions".
2. **`mise.toml` pin Buna.** Zacommitowane `1.4.0`; lokalna weryfikacja szła na niezacommitowanym `1.4.2` (zmiana w working tree, nie moja). CI zainstaluje 1.4.0.
3. **Zrzut `brand/screenshots/plan-wzim-day.png`** zawiera nazwisko prowadzącego („Bartłomiej Kubica") w komórce planu i polskie UI na `/en/`. Zostawić / przyciąć / podmienić?
4. **QR w broszurach** są jasne-na-ciemnym; nie zeskanowane z fizycznego wydruku. Jeden skan telefonem przed drukiem.
5. **`brand/foil-texture.jpg`** (262 KB, q95) leci na każdą stronę przy `opacity: 0.08`. q85 → 115 KB przy 0.023 % RMSE — zmierzone i **cofnięte** (master marki, decyzja właściciela). `brand/` i `public/brand/` trzymają dwie identyczne kopie.
6. **Pluginy w `.claude/settings.json`** (`i-have-adhd`, `shut-up-and-code`) z prywatnych repo bez SHA — decyzja z 2026-09-11 „zostawić"; working tree ma dodatkowo niezacommitowane zmiany w tym pliku (reorganizacja przez harness), nie moje.

## Rulingi podjęte w tej sesji (do cofnięcia, jeśli złe)

| Ruling | Dlaczego | Koszt, jeśli złe |
|---|---|---|
| Trailer commitów = atrybucja tej sesji (`session_01TSRq4Z…`), nie stary URL z planu | instrukcja harnessu | tekst trailera |
| `z.url()`/`z.email()` zamiast `z.string().url()/.email()` | Zod 4.6 deprecates, 7 hintów w `astro check` | dwie linie |
| `CLAUDE.md`, `HANDOFF.md` w `ignorePatterns` oxfmt | `fmt:check` było czerwone od startu | jedna linia |
| Kąt = `abs(atan2)` złożony do kąta ostrego (26.17°), nie 153.83° | brief oczekiwał 20–40°; spec chce nachylenia pasa | jedna linia w `export-logo.ts` + `--angle` |
| Favicon: rect `x=300 y=300 w=600 h=600` zamiast `100%/100%` | `100%` liczy się od viewportu, malowało ćwiartkę | jeden `<rect>` |
| `Mark.astro`: data-URI → `/brand/foil-texture.jpg` | SVG z konfiguratora wkleja ten sam JPEG 4× (1,06 MB); inline zostaje 37 KB; `preserveAspectRatio="none"` + `brightness(1)` = ta sama geometria | jedna linia `replace()` |
| `Mark.astro`: unikalne `id="foil-<uid>"` per instancja | dwa znaki na stronie → `url(#foil)` trafiało w pattern headera; skrypt folii (zad. 10) nie działałby | dwie linie |
| `import … "?raw"` zamiast `readFileSync(new URL(…))` | `readFileSync` ENOENT pod `astro build` (relokacja chunków) | jedna linia |
| Skip-link widoczny na `:focus-visible`; `aria-label` nawigacji z `copy` | plan miał to na sztywno; spec (a11y, stringi z `copy`) jest wiążący | reguła CSS + klucz copy |
| Pas hero na pełną szerokość (`<section>` + wewnętrzny `.container`) | `overflow:hidden` na `.container` obcinał pas do szerokości kontenera | wrapper |
| CTA „Dołącz" w sekcji Dołącz content-width (`justify-items:start`) | grid rozciągał przycisk na 1160 px | dwie linie |
| Globalne `[hidden]{display:none!important}` | scoped `.card{display:grid}` bił UA `[hidden]`; filtr nic nie chował | cztery linie |
| Tytuły stron `… — ${site.name}` zamiast literału „Silver" | fakty z `site.json` | jeden literal na stronę |
| Broszury: `align-content:start` na kartach; QR strefa ciszy 40 px | wiersze grid rozciągały 6 px do 35–60 px; QR miał ~12 px ciszy od dołu | trzy linie |
| `render-brochures.ts`: supresja `no-await-in-loop` z uzasadnieniem; `hostname: 127.0.0.1`; pomiar `.page` 1240×1754; test krótkiego bufora | jedna strona Playwright = sekwencja; lint ma być czysty; asercja rozmiaru nie była tautologią | cztery linie |
| Workflow: najnowsze majory akcji (checkout v7, mise-action v4, upload-artifact v7, upload-pages-artifact v5, deploy-pages v5) | brief kazał sprawdzić; kontrakt artefaktu `github-pages` zachowany | wersje w YAML |
| „Kąt" = nachylenie pasa od poziomu, rosnące w prawo; wzniesienie = szerokość × tan; cięcie kart Steps równoległe do pasa | hero liczył `100%` od wysokości (14°–40°), Steps ciął prostopadle | dwie linie CSS |
| `/projekty`: `ProjectCard expanded` renderuje wiersz platform (klucze `projects.platforms*` w copy) | spec §4: „karty rozwinięte (opis, platformy, stack, linki)" | prop + klucze copy |
| Przełącznik języka w stopce (`route` przekazany z `Base`) | spec §4.6 | jeden komponent |
| Uprawnienia workflow tylko w jobie `deploy`; `concurrency` pages; `if-no-files-found: error`; nawigacja na `127.0.0.1` | higiena CI z końcowego review | kilka linii YAML |

## Odłożone minory (końcowy review: mogą zostać)

Pełna lista w historii tej sesji; najważniejsze grupy:
- `Math.random()` w id patternu → buildy nie są bajt-w-bajt powtarzalne (licznik w `src/lib` naprawia).
- `tan()` w `clip-path` bez fallbacku (Baseline 2023); brak `hreflang="x-default"`.
- Karty: nierówne wysokości w siatce `auto-fit`; zrzuty upscalowane >480 px przy dwóch kartach w rzędzie; powtarzające się nazwy linków „GitHub".
- `HistorySchema`: union bez tagu (rok + zakres naraz przechodzi).
- `Qr.astro` ma `#D8DBDE` na sztywno (kopia `--ink`); `Brochure.astro` powtarza `1240px`; `0{i+1}` psuje się >9; pas broszury ścięty płasko przy 420 px wysokości (609 px potrzebne).
- `export-logo.ts` bez `try/finally` i bez walidacji wyjścia; favicon ręczny, nieodtwarzalny skryptem.
- 711 KB nieużywanych zrzutów (`kampus-sggw-floor.png`, `plan-wzim-list.png`) trafia do `dist/_astro/` przez `import.meta.glob`.
- `astro.config.ts` poza `tsconfig.include`; 17× `(await getEntry(...))!` w widokach (helper `loadCopy/loadSite` by to zdjął).
- Pas hero: powyżej ~2500 px szerokości viewportu wysokość pasa jest przycięta (`min(100%, …)`), a wierzchołek `clip-path` liczony bez przycięcia — kąt spłaszcza się przy prawej krawędzi; nie wychodzi poza hero.

## Jak wznowić

1. `mise install && bun install && bunx playwright install chromium` (na Linuksie też biblioteki systemowe: `bunx playwright install-deps chromium` z sudo — w tej sesji trzeba było je doinstalować przez apt).
2. Pełna bramka: `bun run lint && bun run fmt:check && bun run check && bun test && bun run build && bun run brochure`.
3. Workspace SDD (`.superpowers/sdd/…`, git-ignored) został usunięty po końcowym review — historia gita i ten plik są zapisem.

## Uwaga bezpieczeństwa — pluginy w `.claude/settings.json`

`i-have-adhd@i-have-adhd` i `shut-up-and-code@shut-up-and-code` pochodzą z prywatnych repozytoriów (`ayghri/i-have-adhd`, `chl03ks/shut-up-and-code`) pobieranych z HEAD, bez przypiętego SHA; ich hooki uruchamiają skrypty przy starcie każdej sesji Claude Code w tym repo. Decyzja przewodniczącego (2026-09-11): zostawić. Kto klonuje repo i nie chce tego, usuwa te dwie linie z `enabledPlugins` lokalnie.
