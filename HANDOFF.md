# Handoff — Silver site and brochures

Stan na 2026-09-12 (noc), branch `site` (merge-base z `main`: `acdacd2`). Ten plik jest po to, żeby świeża sesja mogła wznowić pracę bez zgadywania.

## Gdzie jesteśmy

- **Spec (autorytet):** `docs/superpowers/specs/2026-09-11-silver-site-and-brochure-design.md`
- **Plan (14 zadań):** `docs/superpowers/plans/2026-09-11-silver-site-and-brochure.md`
- **Zrobione:** wszystkie 14 zadań + końcowy review całej gałęzi + fala poprawek; potem Impeccable audit/critique i trzy partie poprawek, potem faza „wstęga” (S na pasie przez całą stronę) — sekcje niżej. Każde zadanie przeszło review (spec + jakość); Important-y naprawione w rundach poprawek, minory odłożone (lista poniżej).
- **Bramki (na `e81e954`):** `oxlint` 0 ostrzeżeń, `oxfmt --check` czysto, `astro check` 0/0/0, `bun test` 24/24, `astro build` 12 stron, `bun run brochure` 4× 2480×3508 (+ assert bloków), Lighthouse mobile `/pl/` 97/100, detektor Impeccable `[]`.
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

## Wstęga — S na pasie przez całą stronę (2026-09-11, noc)

Decyzja właściciela: pas z S ma przechodzić przez całą stronę i broszurę. Wybrany układ: **jedna wstęga o stałej grubości** pod kątem 26,17°, na hero strony głównej i obu arkuszach; §8 bez zmian (folia tylko w znaku — wstęga jest częścią SVG znaku — i jednym elemencie hero).

**Mechanizm:** `scripts/export-logo.ts` zapisuje do `brand/logo/geometry.json` oś ramion pasa z konfiguratora (`bandAxis`), szerokość ramienia (136 j.) i offset ramion; `Mark.astro` z propem `ribbon` rysuje wielokąt wstęgi **w tej samej przestrzeni użytkownika SVG**, tym samym `<pattern>`, przed `<use>`; `overflow: visible` na SVG, hero/arkusz obcinają. Folia ciągła bez szwu; skrypt kursora przesuwa wstęgę i S razem (jedna interakcja).

**Odkrycie:** ramiona S **nie są współliniowe** (offset 227,5 j. = 38 % znaku). Prosta wstęga albo połyka S (0,6 × znak), albo zostawia garby ramion. Wstęga jest więc **z uskokiem przy S**, grubość = szerokość ramienia (0,227 × znak); spoiny sprawdzone przy 4× — bezszwowe. Test `tests/geometry.test.ts` pilnuje kształtu `geometry.json` i offsetu.

**Hero:** znak ≈ `clamp(20rem, 32cqw, 30rem)` → wstęga 104 px przy 1440, 122 px przy 1920; `min-block-size: max(48rem, 100svh)`, więc wstęga zawsze wychodzi z ekranu przez realną krawędź; tekst i CTA w wolnym trójkącie (prześwit ≥ 36 px), `.ctas` na 555 px przy 1440×900; h1 w trzech liniach (zaakceptowane).

**Broszury:** nagłówek (wordmark + tytuł + lead), rząd 1 na całą szerokość (kroki / kim jesteśmy), rząd 2 na lewych ~60 % (aplikacje / co zbudowaliśmy), wstęga przez dolną połowę z S po prawej, płyta z QR w prawym dolnym rogu (lewy dolny róg to wyjście wstęgi). QR dopasowane do pełnych modułów w `Qr.astro` (zaokrąglanie w dół do wielokrotności modułu; studenci 175 = 25×7, firmy 174 = 29×6), strefa ciszy ≥ 40 px. Renderer sprawdza dodatkowo, czy żaden blok obcinający (płyta, karty) nie ucina treści. Skala druku o stopień mniejsza (treść karty 18 px = 3,05 mm), QR 29,5 mm — jeden fizyczny skan przed drukiem.

**Rulingi:** uskok zamiast prostej wstęgi; znak w hero powiększony, by wstęga czytała się jako pas; układ arkuszy w rzędach zamiast „schodków" (rozsypywały kompozycję); płyta w prawym dolnym rogu; mono dla `result` tylko gdy zaczyna się cyfrą (pomiar) — `isMeasurement` w `schemas.ts`, wspólne dla strony i arkuszy; numeracja kroków 01/02/03 także na arkuszu (sekwencja niesie informację); pusta przestrzeń po lewej między rzędem 2 a wstęgą przyjęta jako negatyw diagonali.

## Lockup „Silver" — znak S + słowo „ilver" (2026-09-12)

Decyzja właściciela: wordmark to lockup — znak S ze słowem „ilver" pod górnym ramieniem, równolegle
do niego, w **Syncopate 700**, jako **kontury** (nie żywy tekst, nie webfont). Ramiona nie kończą się
w powietrzu: kadr lockupu („płyta" 900 : 460) je obcina.

**Mechanizm:** `scripts/export-lockup.ts` (`bun run lockup:export`) odpala Playwrighta, mierzy
sylwetki liter na canvasie i zapisuje `brand/logo/lockup.json` (kontur słowa w jednostkach znaku,
kadr, metryki), `brand/logo/lockup.svg` (master do rozdawania) i `public/og.png` (eksport og
przeniesiony tu z `export-logo.ts`). Kontury buduje `opentype.js` z tego samego TTF-a; skrypt
sprawdza, że szerokość znaku z przeglądarki i z opentype zgadzają się do 0,002 em. Strona czyta
`lockup.json` przez `src/lib/lockup.ts` i rysuje `src/components/Lockup.astro` (własny `<pattern>`,
ramiona z `markRibbonPath`, `<use>` znaku, kontur słowa — wszystko na jednej folii).

**Reguły dopasowania (port z zatwierdzonego arkusza):** trzon liter = kreska S (50 j.) — najcięższy
krój, którego trzon się w niej mieści; jedno światło (62 j.) zmierzone S→„i" po sylwetkach, ono samo
ustawia słowo pod ramieniem i optycznie między literami; litery kończą się nad spodem S. Wyniki:
waga 700, wysokość liter 0,56 korpusu S, trzon 49,7 j., reszta obrysu 0,3 j. (porzucona — reguła:
< 1 j. porzuć, inaczej eksport pada), kadr `160 -15.8 1804.9 922.5`.

### Rulingi z tej fazy (do cofnięcia, jeśli złe)

| Ruling | Dlaczego | Koszt, jeśli złe |
|---|---|---|
| Syncopate jest w google/fonts na **Apache 2.0**, nie OFL — plik licencji nazwany `LICENSE-Syncopate.txt` | kierunek zakładał OFL; nazwanie licencji Apache „OFL" byłoby błędem | nazwa pliku + zdanie w §8 |
| `brand/fonts/Syncopate-Regular.ttf` zacommitowany, choć nieużywany w renderze | reguła „najcięższy krój, który się mieści" musi mieć nad czym pracować; z listą samego 700 pętla zatrzymuje się na 0,61 korpusu i trzon liter przekracza kreskę S o 4,2 j. | 60 KB w `brand/` |
| Sylwetkę S mierzy **ostatnia podścieżka** ścieżki znaku, nie cała | cała ścieżka niesie też wstęgę, która biegnie tysiące jednostek za kadr | jedna linia |
| Szerokości znaków mierzone przy 2048 px (em kroju), nie przy 200 px | Chromium zaokrągla je do pełnych pikseli — przy 200 px różnica z opentype wychodzi 0,0021 em i asercja pada | jedna stała |
| `src/lib/ribbon.ts` — konstrukcja wielokątów ramion wyjęta z `mark.ts`, bo skrypt eksportu nie może użyć importu `?raw` | jedna kopia geometrii, bez dryfu między masterem SVG i stroną | scalenie z powrotem |
| `src/lib/foil.ts` — skrypt folii wyjęty z `Mark.astro`, importowany przez `Mark` i `Lockup` | jedna kopia; moduł wykonuje się raz, `[data-foil]` szuka po całym dokumencie | dwa `<script>` |
| `render-brochures.ts` pomija `.visually-hidden` w detektorze obcięć | ta klasa obcina z założenia (1 px na nazwę dostępną) | jedna linia |

### Otwarte dla właściciela

- **Wielkość lockupu.** Płyta to w 2,86 × wysokość korpusu S (padding 0,45 korpusu + rozciągnięcie do
  900 : 460), więc litery mają ~19,6 % jej wysokości. Przy `size="2.5rem"` w headerze korpus S ma
  15,7 px, a litery ~8,8 px — mniej niż nawigacja (kapitalik ~11 px); stary header miał znak 32 px
  plus tekst 16 px. W broszurach przy `1.4 × --print-step-5` (114,8 px) litery mają ~22,5 px, a
  tagline pod nimi 36 px — hierarchia odwrócona względem starego wordmarku 82 px. Wartości są z
  kontraktu kierunku; zmiana to jedna liczba na każdym z dwóch miejsc (parytet z nawigacją: ~4rem
  w headerze, ~3,4 × `--print-step-5` na arkuszu).
- `lockup.svg` waży 289 KB (jedna kopia tekstury w data-URI, cztery kafle przez `<use>`).

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
