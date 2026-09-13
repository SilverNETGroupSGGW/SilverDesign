# Handoff — Silver site and brochures

Stan na 2026-09-12 (noc), branch `site` (merge-base z `main`: `acdacd2`). Ten plik jest po to, żeby świeża sesja mogła wznowić pracę bez zgadywania.

## Gdzie jesteśmy

- **Spec (autorytet):** `docs/superpowers/specs/2026-09-11-silver-site-and-brochure-design.md`
- **Plan (14 zadań):** `docs/superpowers/plans/2026-09-11-silver-site-and-brochure.md`
- **Zrobione:** wszystkie 14 zadań + końcowy review całej gałęzi + fala poprawek; potem Impeccable audit/critique i trzy partie poprawek, potem faza „wstęga” (S na pasie przez całą stronę) — sekcje niżej. Każde zadanie przeszło review (spec + jakość); Important-y naprawione w rundach poprawek, minory odłożone (lista poniżej).
- **Bramki (na `0a320d8` + faza openera):** patrz sekcja „Wstęga jako oś strony". Poprzednio (na `e81e954`): `oxlint` 0 ostrzeżeń, `oxfmt --check` czysto, `astro check` 0/0/0, `bun test` 24/24, `astro build` 12 stron, `bun run brochure` 4× 2480×3508 (+ assert bloków), Lighthouse mobile `/pl/` 97/100, detektor Impeccable `[]`.
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
| `brand/fonts/Syncopate-Regular.ttf` zacommitowany, choć nieużywany w renderze | reguła „najcięższy krój, który się mieści" musi mieć nad czym pracować; z listą samego 700 pętla zatrzymuje się na 0,61 korpusu i trzon liter przekracza kreskę S o 4,2 j. | 174 KB w `brand/` |
| Sylwetkę S mierzy **ostatnia podścieżka** ścieżki znaku, nie cała | cała ścieżka niesie też wstęgę, która biegnie tysiące jednostek za kadr | jedna linia |
| Szerokości znaków mierzone przy 2048 px (em kroju), nie przy 200 px | Chromium zaokrągla je do pełnych pikseli — przy 200 px różnica z opentype wychodzi 0,0021 em i asercja pada | jedna stała |
| `src/lib/ribbon.ts` — konstrukcja wielokątów ramion wyjęta z `mark.ts`, bo skrypt eksportu nie może użyć importu `?raw` | jedna kopia geometrii, bez dryfu między masterem SVG i stroną | scalenie z powrotem |
| `src/lib/foil.ts` — skrypt folii wyjęty z `Mark.astro`, importowany przez `Mark` i `Lockup` | jedna kopia; moduł wykonuje się raz, `[data-foil]` szuka po całym dokumencie | dwa `<script>` |
| `render-brochures.ts` pomija `.visually-hidden` w detektorze obcięć | ta klasa obcina z założenia (1 px na nazwę dostępną) | jedna linia |

### Otwarte dla właściciela

- `lockup.svg` waży 289 KB (jedna kopia tekstury w data-URI, cztery kafle przez `<use>`). Płyta
  lockupu (`frame`) nie jest już nigdzie rysowana na stronie — została jako master do rozdawania
  (`lockup.svg`, `og.png`).

## Wstęga jako oś strony — opener (2026-09-12, wieczór)

Decyzja właściciela: wstęga **nigdy nie kończy się w kadrze**. Na każdej stronie i obu arkuszach
wchodzi lewą krawędzią dokumentu i wychodzi górną albo prawą — nigdy dnem sekcji, nigdy pod
niewidoczną plakietką. Znak nie jest prostokątem: tytuł nad wstęgą skraca wiersze wzdłuż jej górnej
krawędzi i wokół S, lead (i CTA na stronie głównej) pod wstęgą zaczyna wiersze od jej dolnej
krawędzi i od spodu słowa. Plakietka lockupu w headerze i masthead arkuszy **zniknęły**
(`Header.astro` i `Lockup.astro` usunięte).

**Mechanizm.** `src/lib/opener.ts` liczy całą konstrukcję z `geometry.json` + `lockup.json`
(dorzucone tam przy eksporcie: `wordBox`, `bodyBox`, `markViewBox` — nic nie jest przepisywane
ręcznie):

- `Form` — każdy punkt jest **liniowy** w `--m` (rozmiar kadru znaku), `--bx`/`--by` (lewy górny róg
  korpusu S), `--g` (światło do folii), `--w`/`--h` (kadr openera) i origin strefy. `formCss()`
  wypisuje go jako `calc()`, `evalForm()` liczy jako liczbę — jedna definicja dla CSS i dla testu.
- `aboveBoundary` / `belowBoundary` — te same łamane co w zatwierdzonym mocku (`ribbon-layout`
  `scene()`), `shapeAbove` / `shapeBelow` → `polygon()` w `shape-outside`. Punkty poza kadrem są
  legalne (wielokąt obcina się do margin-boxa floata), więc **zawsze** wypisujemy wyjście górą; przy
  400–768 px wstęga wychodzi prawą krawędzią i ten sam wielokąt nadal jest poprawny.
- `Size` + `openerLayouts` — rozmiary trzech wariantów (`home`, `page`, `sheet`) jako dane
  (`clamp`/`min`/`max`/`sum` nad `px`/`rem`/`cqw`/`svh` i nad `--m`…`--g`). `openerStyle()` robi z
  nich atrybut `style` komponentu, `openerSizes()` te same wartości dla testu. Zero media queries:
  jedno wyrażenie płynne na wariant.
- `--h` **nie jest zgadywane**: jednym ze składników `max()` jest wysokość, na której dolna krawędź
  dolnego ramienia jeszcze wychodzi lewą krawędzią. Niezmiennik 1 jest więc spełniony konstrukcyjnie
  na każdej szerokości.

**Bramka po tej fazie:** `oxlint` czysto, `oxfmt --check` czysto, `astro check` 0/0/0, `bun test`
107/107 (6 plików), `astro build` 12 stron, `bun run brochure` 4× 2480×3508 (14/13 pudełek na
obcięcie + 6 par na nachodzenie), Lighthouse mobile: `/pl/` 97 perf / 100 a11y / 100 bp / 100 seo,
`/pl/projekty/` 95/100, `/pl/historia/` 99/100.

**Wartości** (px przy danej szerokości; `rem` = `clamp(16, 15.2 + 0.25vw, 18)`):

| właściwość | home | page | sheet |
|---|---|---|---|
| `--m` | `clamp(7.8rem, 23.6cqw, 22rem)` | `clamp(6.5rem, 18cqw, 16rem)` | 200 px |
| `--bx` | `clamp(3rem, 44.5cqw - 125px, 60rem)` | `clamp(3rem, 38cqw - 107px, 40rem)` | 420 px |
| `--by` | szeroki: `--above-y + 0.50583·--m` (wierzch słowa = wierzch tytułu); wąski: `max(--above-y + --title-band + --g + 0.50583·--m, prześwit nawigacji)` | to samo | `96px + 0.50583·--m` |
| `--g` | `clamp(12px, 1.39cqw, 20px)` | `clamp(12px, 1.11cqw, 16px)` | 16 px |
| `--h` | szeroki: `max(48rem, 100svh, wyjście+2rem)`; wąski: `wyjście+2rem` | `max(26rem, wyjście+2rem)` | `max(585px, wyjście+1rem)` |
| `--above-x` | `min(max(--gutter, 50cqw - 36rem), 24rem)` | to samo | 96 px |
| `--above-y` | `max(clamp(4.5rem, 8.9cqw, 7.5rem), --nav-top + 4rem)` | to samo | 96 px |
| `--below-x` | `max(--above-x, --bx - 0.77·--m)` | to samo | `max(96px, …)` |
| `--below-y` | `--by + 0.269·--m` (połowa wysokości S) | to samo | to samo |
| `--title` | `clamp(min(2rem, 8cqw), 4.4cqw, 3.6rem)` | to samo | 44 px |
| `--nav-top` / `--nav-w` / `--nav-h` | `clamp(1rem, 2.4cqw, 2rem)` / `min(80cqw, 21rem)` / `4rem` | to samo | 0 |

Przy 1440×900 wychodzi z tego dokładnie mock: `--m` 340, `--bx` 562, `--by` 250, lead na 473 px,
tytuł na 128 px, wstęga na lewej krawędzi 688–774 px, wyjście górą 1109–1284 px.

**Poprawka po przeglądzie właściciela (2026-09-12, noc):** lead trzymał się ~200 j. od słowa, bo
„dolna linia słowa" była liczona z rogów osiowego bboxa obróconego napisu (ten sam błąd był w
zatwierdzonym mocku). `export-lockup.ts` zapisuje teraz `wordSpan` — rzut konturu słowa na oś
ramienia i jej normalną — i opener używa go zamiast `wordBox`. Druga poprawka: granica pod S szła
pionowo w lewej krawędzi korpusu i wpuszczała pierwszą literę leadu pod róg dolnego ramienia; teraz
biegnie wzdłuż krawędzi ramienia do linii spodu S. Trzecia: pozycja logo od góry ma regułę zamiast
dopasowanej liczby — na szerokim openerze wierzch słowa leży na wierzchu tytułu (`--by-wide`), na
wąskim pod pasmem tytułu (`--title-band` = linie tytułu × 1,02 × `--title`, linie liczone z długości
tytułu: ~14 znaków na linię przy 320 px), z dolnym ograniczeniem, przy którym górne ramię na prawej
krawędzi mija pudełko nawigacji; wybór szeroki/wąski to `@container (width < 56rem)` na `.frame`,
w teście `narrow: w < 56·rem` (było 64rem — patrz „Układ B"). Arkusz: znak 200 px (był 240), bo z wierzchem słowa na wierzchu tytułu
wyjście dolnego ramienia zjeżdżało o 68 px za budżet arkusza studentów.

**Niezmienniki** (`tests/opener.test.ts`, 400/768/1024/1440/1920/2560, `--h` na podłodze):
1. dolna krawędź dolnego ramienia przecina `x = 0` nad spodem openera;
2. górne ramię wychodzi górą albo prawą krawędzią (jedna krawędź pasma może minąć prawy górny róg,
   jeśli druga wychodzi prawą krawędzią nad spodem);
3. koniec słowa ≤ 0,95 × szerokość;
4. pudełko nawigacji (`--above-x`, `--nav-top`, `--nav-w` × `--nav-h`) nie przecina żadnego z dwóch
   pasm — liczone na jego prawej krawędzi, gdzie pasmo jest najwyżej;
5. `--by ≥ --nav-top + --nav-h + --g`; lead startuje pod spodem S i nie bliżej lewej niż tytuł;
6. **góra lockupu** (`evalForm(lockupBox.origin[1], v)`) `≥ --g` — słowo jest tą częścią kompozycji,
   która *nie* ma wychodzić krawędzią, a opener obcina; niezmiennik 3 pilnował tego tylko w x.

Uwaga o pomiarze: `openerSizes()` liczy `cqw` od szerokości viewportu, a przeglądarka od kadru
openera. Opener jest na pełną szerokość, więc różnica to pasek przewijania (~15 px na desktopie):
zapas niezmiennika 3 przy 1440 px spada wtedy z 22 px do ~8 px. Gdyby opener kiedyś przestał być
pełnej szerokości, trzeba podać jego szerokość do `openerSizes()`.

**Kadr, strefy, nawigacja.** Opener siedzi w `div.frame` z `container-type: inline-size` — element
nie odpowiada na własne container queries, więc gdyby `container-type` był na openerze, `cqw` w
`--h` i w wierszach grida liczyłoby się od viewportu (razem z paskiem przewijania), a nie od jego
kadru. Sam opener to grid o wierszach `minmax(var(--below-y), auto) auto`: strefa nad wstęgą jest w
wierszu 1 (jej float ma dokładnie wysokość `--below-y - --nav-top`, więc wiersz 1 normalnie równa się
`--below-y`), strefa pod wstęgą w wierszu 2. Kiedy tytuł potrzebuje więcej (root font 32 px), wiersz
1 rośnie i **przesuwa lead** zamiast dać się obciąć. Nawigacja jest w strefie nad wstęgą, **w flow i
inline-level** (`display: inline-flex`): blok omijałby cały margin-box floata, a pozycjonowana
absolutnie nie mogłaby przesunąć tytułu, kiedy zawinie się na drugi wiersz; `--nav-h` to tylko
rezerwa, a `h1` dostaje `margin-block-start: --above-y - --nav-top - --nav-h`. Cel skip-linku
(`id="main"`) siedzi na `h1`, więc „przejdź do treści" ląduje na tytule strony, nie za nim.

**Arkusze.** `Brochure.astro` nie pozycjonuje już bloków (`--left/--top/--w`, `.over`, `.under`,
`markTop`, `.markwrap` — wszystko usunięte): sheet to kolumna flex (`gap: 24px`, `flex: 0 0 auto`,
płyta z `margin-block-start: auto`), a wstęga jest w górnej trzeciej jako opener `variant="sheet"`.
Renderer dostał dodatkowo **detektor nachodzenia** par bloków (`.page > *`) — 6 par na arkusz.

### Rulingi z tej fazy (do cofnięcia, jeśli złe)

| Ruling | Dlaczego | Koszt, jeśli złe |
|---|---|---|
| `--g` o połowę mniejsze niż w mocku (20/16/12 px zamiast 40/32/20) | decyzja właściciela w trakcie implementacji | jedna wartość na wariant |
| Link do strony głównej obejmuje **ciasny** box S + słowa (`bodyBox ∪ wordBox`), nie płytę `frame` | płyta sięga 0,48 kadru w lewo i 0,5 w górę — przezroczysty link wchodziłby na tytuł | dwie linie w `lockupBox` |
| Opener to `<header>`, `<main>` startuje po nim | h1 i lead poza landmarkiem byłyby „orphan content"; skip-link ma przeskakiwać nawigację i hero | jeden tag |
| Strefa pod wstęgą jest w flow (`display: flow-root`), strefa nad nią absolutna | dłuższa kopia wydłuża opener, zamiast zostać obcięta przez `overflow: hidden` | jedna reguła |
| Wielokąty w `style` **strefy**, nie openera | własność custom rozwija swoje `var()` na elemencie, na którym jest zadeklarowana; na openerze `var(--zone-x)` nie istnieje i cały wielokąt przepada w ciszy (float na pełną szerokość) | dwie linie |
| `calc(0px - var(--x))` zamiast `-var(--x)` | calc nie zna unarnego minusa przed `var()`; test pilnuje, że w wielokącie nie ma `-var(` | jedna linia |
| `.zone > :global(*) { pointer-events: auto }` | CTA są slotowane, więc mają scope `Home.astro`; scoped selektor ich nie łapał i przyciski nie dały się kliknąć | jedna reguła |
| `text-wrap: pretty` na h1 openera (selektor `.above h1`, żeby pobić `h1` z `base.css`) | `balance` liczy znaki względem prostokąta, który shape już rozebrał | jedna reguła |
| `--title` zatrzymane na 3,6rem; na arkuszu 52 px | przy 4rem najdłuższe polskie słowo tytułu nie wchodzi w kolumnę obok S i `break-word` łamie je w środku (arkusz: wiersz spadał pod wstęgę) | dwie stałe |
| `--nav-w` = `min(80cqw, 21rem)` | pudełko nawigacji jest asercją: przy 30rem pasmo górnego ramienia realnie wchodziło pod „English" na podstronie przy 400 px | jedna wartość |
| Arkusz firm: „co zbudowaliśmy" w 4 kolumnach | 2 kolumny × 2 rzędy nie wchodziły w 1754 px po dodaniu openera | jedna wartość `--cols` |
| Płyta z QR na całą szerokość treści arkusza, na dole | dolny lewy róg jest już wolny (wstęga jest u góry), a kod dostaje strefę ciszy z paddingu płyty | jedna reguła |
| Tekstura folii preloadowana na każdej stronie (nie tylko home) | wstęga jest teraz na każdej stronie i jest elementem LCP | jedna linia w `Base.astro` |

### Runda poprawek po review (2026-09-12, wieczór)

| Poprawka | Dlaczego |
|---|---|
| `--by` w górę (home `12.5rem`, page `11rem`, arkusz 140 px), arkusz `--bx` 490 px | góra słowa (`--by - 0.50583·--m`) schodziła pod zero: przy `page` od ~1460 px i `home` od ~2090 px opener ścinał „r" w „Silver". Nowy niezmiennik 6 pilnuje tego liczbowo |
| Grid `minmax(var(--below-y), auto) auto` + strefa nad wstęgą w flow | przy root font 32 px tytuł tracił 262 px pod `overflow: hidden`; teraz wiersz 1 rośnie i przesuwa lead |
| `--title` z podłogą `min(2rem, 8cqw)` | 2rem przy root 32 px to 64 px w kolumnie 368 px — tytuł rozsypywał się na 13 wierszy z łamaniem słów; `cqw` trzyma linię displayową w jej kolumnie, a lead, nawigacja i przyciski dalej skalują się w `rem` |
| Nawigacja w flow, `display: inline-flex` | zawinięta na dwa wiersze (root 32 px) wchodziła na tytuł; blokowy flex omijałby cały margin-box floata zamiast jego kształtu |
| `container-type` na `div.frame` | element nie odpowiada na własne container queries — `cqw` na openerze liczyło viewport |
| `id="main"` na `h1`, link lockupu przed strefami | „przejdź do treści" przeskakiwało tytuł i lead; link do strony głównej był ostatni w kolejności fokusa, choć czyta się jako pierwszy |
| Arkusz: `hyphens: manual` + tytuł 44 px | 52 px z `hyphens: auto` łamało angielski tytuł dywizem („com-/puter"), a bez dywizu rozbijało go na pięć wierszy po jednym słowie |
| Skrypt folii importowany w `Home.astro`, nie w openerze | moduł jechał na każdą stronę i oba arkusze, gdzie nic nie ma `data-foil`; zniknęła też reguła `.page > script` |
| `markRibbon`, `lockupFrame`, `lockupRatio`, `lockupArmsPath` usunięte | bez wywołań po usunięciu `Header.astro`/`Lockup.astro`; oxlint nie widzi nieużywanych eksportów |

### Runda Impeccable `polish` (sekcja Refine) po openerze (2026-09-12, noc)

Raport i przegląd: scratchpad sesji (`refine/refine-report.md`, `refine/refine-review.md`).
Commity `0d2c68a`, `22463e3`, `defd0b7` + runda poprawek po review.

| Poprawka | Dlaczego |
|---|---|
| Twarde spacje „na SGGW", „at SGGW", „— i uczymy" | przy 768 i 2560 tytuł łamał się przed „SGGW", lead przed „i" — sierotki |
| Ring fokusu linku lockupu: `box-shadow: 0 0 0 3px var(--bg)` | biały outline na folii mierzył 1,3:1; wypełnienie offsetu tłem daje 16:1 |
| Przyciski hero bez `font-size: var(--step-0)` i `line-height: 2.6`; `margin-block: 0.35em` | krok skali liczony drugi raz (20,25 px zamiast 18) i przycisk 85 px zamiast 56; na telefonie rzędy się stykały |
| `--h` home na wąskim = samo `wyjście+2rem` (`--h-wide`/`--h-narrow`, jak `--by`) | `100svh` trzymało 276–404 px pustki nad „Jak to działa" na telefonie i tablecie; na szerokim ekranie przekątna zajmuje dodaną wysokość, więc podłoga zostaje |
| `hyphenate-limit-chars: 10 4 4` + `-webkit-hyphenate-limit-before: 4` | Chromium dzielił angielski tytuł „sci-/ence" przy 400 px; limit zostawia dywiz słowom ≥ 10 znaków (root 32 px); Firefox nie zna żadnego i wraca do `hyphens: auto` |
| `openerSizes` liczy `g` przed `by` | wąskie `--by` czyta `--g`; wcześniej model był o `--g` niżej niż przeglądarka i niezmiennik 1 przechodził na 2–5 px zapasu zamiast 2rem |
| Test po obu stronach punktu przełączenia (dziś 980 i 1000 px) | tam wąska podłoga `--h` jest najciaśniejsza |

Rulingi (próby cofnięte, żeby nikt ich nie powtarzał):

| Ruling | Dlaczego | Koszt, jeśli złe |
|---|---|---|
| Czapka `24rem` na `--above-x` zostaje, choć od ~2180 px kolumna openera i `.container` rozjeżdżają się o 200 px (2560) | bez czapki podstrona łamała tytuł w środku słowa („Projekt/y" przy 2560), bo `--bx` też ma czapkę; właściwa poprawka to zatrzymać centrowanie `.container` na tym samym 24rem w `base.css` — decyzja właściciela | jedna reguła w `base.css` |
| Podłoga `--m` w `rem`, nie w `cqw` — przy 200 % zoomu na 400 px słowo jest obcięte („SILV") | podłoga w `cqw` zmniejsza znak, podnosi `--by` i przekątna wchodzi w kolumnę tytułu, który rozsypuje się na pojedyncze litery; obcięte słowo to skaza, rozsypany h1 to wada treści | jedna stała |
| Lead bez miary na ultra-wide (93 znaki w jednej linii na Projektach przy 2560) | poprawka przez `padding-inline-end` liczone od kształtu (`--bx + 0,29·--m + 34·--lead`) dodaje składnik do konstrukcji; zamiast tego propozycja układu B (lead do prawego marginesu, miara 40ch) czeka na decyzję właściciela | jedna reguła |

Propozycje tekstów (nic nie zmienione — §2): EN lead „than from classes" → „than from class";
PL CTA „Wejdź na Discorda" (zgodne z krokiem „Wchodzisz na Discorda", rząd przestaje się łamać przy
400 px). Warianty układu i tekstów: artefakt „Opener: warianty i teksty".

### Układ B: lead do prawego marginesu, ciaśniej wokół znaku (2026-09-12, noc)

Decyzje właściciela: układ B z makiety „Opener: warianty i teksty" (lead i CTA wyrównane do prawego
marginesu), lead napisany od nowa, a odstępy tytuł–znak–lead mniejsze i zawijanie na większej
liczbie ekranów.

| Zmiana | Dlaczego |
|---|---|
| `.below .lead`: `text-align: end`, `margin-inline-start: auto`, miara z `base.css` (60ch) | prosty prawy brzeg leadu naprzeciw prostego lewego brzegu tytułu; poszarpana krawędź wypada wzdłuż słowa i folii. Miara 40ch z makiety cofnięta: blok nie dotykał przekątnej przy 1440 |
| `--below-y = --by + 0.269·--m` (połowa S) zamiast spodu S + 2·--g | spód słowa biegnie od prawego dolnego rogu S w górę, więc wiersze obok dolnej połowy S siedzą **pod słowem** i schodzą po nim; światło daje `shape-margin`, nie `--below-y` |
| `--bx` mniejsze o ~8 % (home `44.5cqw - 125px`, page `38cqw - 107px`) | znak bliżej tytułu; przy 1300 px kolumna tytułu obok S ma jeszcze ~4 px zapasu na „informatyków" — niżej nie schodzić bez zmniejszenia `--title` |
| Punkt przełączenia 64rem → 56rem (~990 px) | laptop 1024 dostaje tytuł w trzech wierszach obok S i zawijanie leadu; 768 zostaje wąski (kolumna 184 px nie mieści „informatyków") |
| CTA: `text-align: end`, margines z lewej strony przycisku | rząd przycisków pod prawym brzegiem leadu; na telefonie schodkują w prawo |
| Test „lead startuje obok dolnej połowy S" (`belowY ≥ by + 0.269·m`), szerokości 980 i 1000 | niezmiennik dopasowany do nowej reguły; obie strony nowego punktu przełączenia |

**Teksty (ta sama noc).** Lead strony głównej napisany od nowa na życzenie właściciela (PL:
„Plan zajęć i mapa kampusu w telefonie to nasza robota. Następne aplikacje piszemy w małych
zespołach, przez semestr — i szukamy do nich ludzi."; EN nie słowo w słowo). Potem właściciel:
„przepisz wszystkie teksty opisujące na bardziej naturalne — nie brzmiące na bezpośrednio
przetłumaczone": 30 stringów (15 EN w `copy/en.json`, 3 PL, 4 w projektach, 8 w historii), raport
z tabelą przed/po w scratchpadzie sesji (`copy-report.md`), review `copy-review.md`. Zasada: żaden
fakt nie doszedł ani nie ubył (§2/§3); lead arkusza studentów niesie ten sam komunikat co hero.
Twarde spacje w leadach: po jednoliterowych, wokół myślnika („semestr — i"), w „nich ludzi".

Uwaga: `text-wrap: pretty` na leadzie nie działa obok floata z kształtem (Chromium wyłącza łamanie
wynikowe przy zmiennej szerokości wierszy), więc dwuwyrazowe wdowy w leadzie zostają.

### Podstrony: logo w nawigacji, sama wstęga w tle (2026-09-13, rano)

Ostatnia decyzja właściciela: logo (S + „ilver") wraca **do topbaru jako pierwszy element** i link
do strony głównej (`nav .logo`, `lockupTightViewBox` = korpus S ∪ słowo z 12 j. zapasu, ramiona
obcięte pudełkiem, 2,75rem wysokości), a w tle zostaje **sama wstęga**: prosty pas
(`markBandPath`, oś górnego ramienia bez uskoku) z `opacity: 0.25`, w tym samym miejscu, w którym
biegło górne ramię lockupu z poprzedniej wersji (`--m/--bx/--by` bez zmian), `--h = 0`
i `overflow: visible` + `clip-path: inset(0 0 -200vh 0)`, więc pas biegnie pod treścią aż do lewej
krawędzi. Pas może przechodzić za linkami nawigacji (ruling), nawigacja na podstronie ma
`max-inline-size: none`; poniżej 40rem odstępy i logo są mniejsze, żeby pięć elementów weszło
w jeden wiersz. **Wstęga logo w topbarze** (`ribbonTopBar`, `markTopBarPath`): górne ramię biegnie
w nieskończoność (wychodzi górą strony), dolne biegnie prosto 140 j. za końcem zwężenia (ruling:
nie zaginać pasa, dopóki zmienia grubość), potem skręca łukiem o promieniu 260 j. w poziom i biegnie
w lewo do krawędzi strony jako dolna krawędź topbaru, poniżej wiersza nawigacji. Wiersz nawigacji
centruje się na ciasnym pudełku S + słowo (`--box-*` w stylu linku, `--logo-h` 3rem / 2,5rem na
telefonie), więc linki leżą na wysokości środka słowa. Własne ramię znaku jest obcięte `clipPath` w punkcie pełnej szerokości
(`markTopBarKeep`), bo plik znaku rysuje je do krawędzi pudełka i wystawałoby pod pasem. Svg logo
jest absolutny w linku o rozmiarze ciasnego pudełka lockupu (1188 × 650 j.), `overflow: visible`,
a `clip-path` openera tnie ramiona na krawędziach strony. Testy dla
`backdropVariants`: `exits(v, true)` (krawędzie pasa), bez niezmienników o słowie i S. Sekcja niżej
opisuje wersję pośrednią z całym lockupem w tle — zostawiona dla historii decyzji.

### Podstrony: logo jako przyciemnione tło (2026-09-13, noc — zastąpione)

Decyzja właściciela: „Silver" ma wybrzmieć na stronie głównej, a na podstronach nie przeszkadzać —
ale każdy Silver, także ten mały w hero podstron, ma być prawdziwym logiem z nieskończoną wstęgą.
Wariant `page` rysuje więc cały lockup (ramiona, S, słowo) jako **tło z `opacity: 0.25`**, a
nawigacja, tytuł i lead stoją na nim w jednej kolumnie do lewej, bez zawijania i bez floatów
(`backdropVariants`). S siedzi na prawo od kolumny tytułu (`--bx = --above-x + clamp(10rem, 25cqw,
16rem)`), wierzch słowa na wysokości nawigacji (`--by = --nav-top + 0,506·--m`), znak
`clamp(5.5rem, 12.5cqw, 11rem)`, wierzch słowa jedną odległość pod linią nawigacji (za linkami
przechodzi tylko wstęga). **`--h = 0`:** nagłówek jest tak wysoki jak jego treść (~330 px przy
1440), a przyciemniona wstęga nie jest obcinana dołem — `overflow: visible` z `clip-path:
inset(0 0 -200vh 0)` tnie ją górą i bokami, więc biegnie dalej pod treścią strony, aż sama wyjdzie
lewą krawędzią (reguła „nigdy nie kończy się w kadrze" zachowana, bez pustki między leadem
a treścią). Test wyjść dla `backdropVariants` sprawdza tylko, że ramiona sięgają krawędzi poniżej
góry. S ze słowem dalej jest linkiem
do strony głównej. Testy dla `backdropVariants`: pudełko nawigacji może leżeć na folii (tło),
S startuje pod realną linią nawigacji (2,4rem), niezmiennik o leadzie obok S pominięty. Próba
z samym pasem przez róg (`c18ced5`) cofnięta tą decyzją.

**Wiersze leadu (`src/lib/wedge.ts`).** Pod wstęgą miejsce rośnie z każdym wierszem, więc lead ma
kończyć się najdłuższym. Skrypt po `document.fonts.ready` (i przy `resize`) dobiera `text-indent`
pierwszego wiersza spośród 24 kandydatów tak, by każdy kolejny wiersz zaczynał się co najmniej
o jedną wysokość wiersza bardziej w lewo (schodki, nie blok z krótkim pierwszym wierszem);
na podstronach i tam, gdzie nie ma floata, nic nie zmienia. Lead openera nie ma miary — przekątna
wyznacza początki wierszy. Renderer arkuszy czeka dwie klatki po `fonts.ready`, bo skrypt układa
lead w klatce.

### Otwarte dla właściciela (opener)

- **Puste pole pod wstęgą.** Na `page` przy 1920–2560 px opener rośnie do 818–838 px (geometria: im
  dalej w prawo i niżej siedzi S, tym niżej wstęga wychodzi lewą krawędzią; podniesienie `--by` z
  rundy poprawek dodało ~45 px). Negatyw diagonali przyjęty jak w mocku; alternatywa to niższe
  `--bx` (S bliżej lewej) albo mniejszy `--m`.
- **Długie słowo w tytule.** Kolumna obok S jest węższa niż cały kadr, więc podłoga to najdłuższe
  słowo tytułu przy `--title`. Sprawdzone na zrzutach dla PL i EN; testem nie da się tego złapać bez
  metryk fontu.
- **Wyjście prawą krawędzią przy 768 px** (home): górne ramię mija prawy górny róg 50 px pod
  krawędzią. Zgodne z decyzją („górną albo prawą"), ale trójkąt nad wstęgą jest tam mały.
- Na telefonie CTA układają się jeden pod drugim (pasmo obok wstęgi jest za wąskie na dwa).

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
