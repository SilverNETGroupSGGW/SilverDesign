---
name: Silver
description: Koło naukowe informatyków na SGGW — jedna wstęga folii na grafitowym tle.
colors:
  covert-black: "#16161b"
  graphite-surface: "#1e1e24"
  divider-line: "#34343c"
  control-edge: "color-mix(in srgb, #d8dbde 44%, #16161b)"
  chrome-silver: "#d8dbde"
  pewter-muted: "#9a9ea5"
  polished-highlight: "#f2f3f5"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(min(2rem, 8cqw), 4.4cqw, 3.6rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.95rem, 1.5rem + 2vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.05rem, 1.67cqw, 1.35rem)"
    fontWeight: 400
    lineHeight: 1.35
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.95rem + 0.25vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(0.83rem, 0.8rem + 0.15vw, 0.9rem)"
    fontWeight: 400
    letterSpacing: "0.08em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "clamp(0.83rem, 0.8rem + 0.15vw, 0.9rem)"
    fontWeight: 400
spacing:
  "2": "0.5rem"
  "3": "1rem"
  "4": "1.5rem"
  "5": "2.5rem"
  "6": "4rem"
  "7": "6rem"
  cut: "1.25rem"
  gutter: "clamp(1rem, 4vw, 2.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.chrome-silver}"
    textColor: "{colors.covert-black}"
    padding: "0.75em 1.25em"
  button-primary-hover:
    backgroundColor: "{colors.polished-highlight}"
    textColor: "{colors.covert-black}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.chrome-silver}"
    padding: "0.75em 1.25em"
  button-ghost-hover:
    backgroundColor: "{colors.graphite-surface}"
  filter-pill:
    backgroundColor: "transparent"
    textColor: "{colors.pewter-muted}"
    padding: "0.4em 1em"
  filter-pill-pressed:
    backgroundColor: "{colors.chrome-silver}"
    textColor: "{colors.covert-black}"
  card:
    backgroundColor: "{colors.graphite-surface}"
    textColor: "{colors.chrome-silver}"
    padding: "{spacing.4}"
  join-strip:
    backgroundColor: "{colors.graphite-surface}"
    padding: "{spacing.5}"
---

# Design System: Silver

## Overview

**Creative North Star: "The Single Ribbon"**

Cały system to jeden pas srebrnej folii, który wchodzi lewą krawędzią dokumentu, rysuje
znak S i wychodzi górą albo prawą stroną. Wszystko inne jest tym pasem w mniejszej skali.
Ścięty róg karty, znacznik nad nagłówkiem, uniesiona końcówka linii na osi czasu i kierunek
każdego wejścia mają ten sam kąt: 26,17° (`--angle`, z `brand/logo/geometry.json`). Gdy
element nie wie, jaki ma przyjąć kształt, przyjmuje ten kąt albo zostaje prosty.

Tło jest grafitowe, prawie czarne, a jedyny akcent to chrom. Interfejs nie ma żadnej barwy,
tylko szarości wyprowadzone z dwóch kolorów marki; przygaszony kolor niosą jedynie zrzuty
aplikacji. Folia (`brand/foil-texture.jpg`) jest
materiałem, nie ozdobą: występuje tylko w znaku S i w pasie otwierającym stronę, dlatego
ma wagę. Komponenty są techniczne i precyzyjne. Cienkie linie, cyfry
tabularne, Geist Mono przy identyfikatorach i pomiarach. Wyglądają raczej jak rysunek techniczny niż
interfejs aplikacji.

Ruch opowiada ten sam pas: każde wejście jedzie w górę wzdłuż osi wstęgi, od dołu i z lewej.
Linie rysują się wzdłuż siebie, a wypełnienia wjeżdżają ścięciem naprzód. Gęstość jest
umiarkowana. Szerokie sekcje (4–6rem) oddzielają małe, zwarte bloki treści.

**Key Characteristics:**

- Jeden kąt (26,17°) dla każdej przekątnej w systemie.
- Folia tylko w znaku S i pasie hero.
- Grafit i chrom, bez barwy, kontrast tekstu ≥ 4.5 : 1.
- Zero cieni; głębia z płaszczyzn tonalnych.
- Ruch wzdłuż osi wstęgi; przy `prefers-reduced-motion` zostają same przenikania.

## Colors

Monochromatyczna paleta z dwóch kolorów marki: grafitowej czerni i chromowanego srebra.
Każdy pośredni odcień jest z nich wyprowadzony.

### Primary

- **Chrome Silver** (`chrome-silver`): tekst podstawowy, wypełnienie przycisku głównego
  i wciśniętej pigułki filtra, znaczniki nagłówków, obrys przycisku-ducha. Kontrast
  12,97 : 1 na tle, 11,93 : 1 na powierzchni.

### Neutral

- **Covert Black** (`covert-black`): tło strony i broszur, tekst na srebrnych wypełnieniach.
- **Graphite Surface** (`graphite-surface`): karty, kroki, pasek „Dołącz”, stopka, hover
  przycisku-ducha. Jeden stopień jaśniej od tła.
- **Divider Line** (`divider-line`): obramowania kart, dzielniki osi czasu, krawędź ścięcia
  stopki. Element czysto dekoracyjny (1,46 : 1), nigdy jedyna granica kontrolki.
- **Control Edge** (`control-edge`, 44% srebra na czerni ≈ #6b6d71): obrys kontrolki
  w spoczynku i kolor paska przewijania. 3,48 : 1 na tle, 3,20 : 1 na powierzchni
  (WCAG 1.4.11).
- **Pewter Muted** (`pewter-muted`): tekst drugorzędny (opisy, stack, lata na osi czasu,
  etykiety stopki, nieaktywna nawigacja). 6,7 : 1 na tle, 6,17 : 1 na powierzchni.
- **Polished Highlight** (`polished-highlight`): tytuł hero, wynik na karcie projektu,
  hover przycisku głównego, pierścień fokusu, linia biegnąca po kroku. To najjaśniejszy
  punkt na ekranie i występuje oszczędnie.

### Named Rules

**The No-Hue Rule.** Żadnej barwy w interfejsie poza szarościami (zrzuty aplikacji rządzą się
Developed Print). Nowy kolor powstaje jako mieszanka srebra z czernią, a każdy kolor tekstu musi mieć zmierzone ≥ 4.5 : 1 na swoim tle.

**The Foil Exclusivity Rule.** Tekstura folii występuje tylko wewnątrz znaku S (z wstęgą
i słowem lockupu) i w pasie hero. Nie trafia do kart, przycisków, teł sekcji ani gradientów.

**The Developed Print Rule.** Zrzuty aplikacji pochodzą z ich stron w Google Play (Dni SGGW
po wydarzeniu zniknęły ze sklepów, więc z wersji webowej) i mają przygaszony kolor: 40%
nasycenia, wypalone w kadrze przez `scripts/derive-assets.ts`, także po najechaniu. Tyle,
żeby odróżnić pinezkę od budynku. W pełnym kolorze pinezki i akcenty z cudzego UI byłyby
najgłośniejszą rzeczą na stronie i przebiłyby Polished Highlight. Projekt bez własnych
ekranów (Charmander) pokazuje prawdziwy fragment swojego kodu, złożony w Geist Mono
w szarościach strony (`scripts/render-code-shot.ts`), nigdy grafikę zastępczą.

**The Divider Is Decoration Rule.** `divider-line` nie może być jedyną granicą czegoś, w co się
klika. Kontrolka w spoczynku dostaje `control-edge`.

## Typography

**Display Font:** Geist (z system-ui)
**Body Font:** Geist (z system-ui)
**Label/Mono Font:** Geist Mono (z ui-monospace), dla identyfikatorów i pomiarów

**Character:** Jedna rodzina zmienna (self-hosted woff2, latin + latin-ext) w roli
bezszeryfowego narzędzia: chłodna, wąsko zbita w nagłówkach, spokojna w tekście.
Wordmark „ilver” jest w Syncopate 700, ale tylko jako kontury w lockupie. Syncopate nie jest
webfontem i nie występuje nigdzie indziej.

### Hierarchy

- **Display** (`display`): tytuł w pasie otwierającym, w Polished Highlight. Rozmiar zależy
  od szerokości kontenera (`cqw`), a wiersze opływają przekątną pasa (`shape-outside`)
  zamiast być balansowane.
- **Headline** (`headline`): nagłówki sekcji (H2), zawsze ze znacznikiem `.angled` nad sobą.
- **Title** (`title`): nazwy projektów, tytuły kroków i wpisów osi czasu, tekst paska
  „Dołącz”.
- **Lead** (`lead`): lead hero pod pasem, wyrównany do prawej, żeby postrzępiona krawędź
  biegła wzdłuż przekątnej. Na podstronach i poza hero lead ma 48ch i jest wyrównany do
  lewej.
- **Body** (`body`): tekst podstawowy, miara 58ch, `text-wrap: pretty`.
- **Label** (`label`): etykiety kolumn stopki, wersaliki, odstęp 0.08em, kolor Pewter Muted.
- **Mono** (`mono`): identyfikatory (pakiety, adresy, e-maile, link Discorda) z `overflow-wrap: anywhere`
  oraz liczby i pomiary: numery kroków, lata na osi czasu i wyniki kart, które zaczynają się
  od liczby. Wynik opisany zdaniem (Charmander) zostaje w Geist.

Liczby (kroki 01–03, lata) mają `font-variant-numeric: tabular-nums`.

### Named Rules

**The One Family Rule.** Geist do wszystkiego, a Geist Mono do dwóch rzeczy: identyfikatorów
(pakiety, adresy, e-maile) oraz liczb i pomiarów (numery kroków, lata, wyniki z liczbą). Zdanie
zostaje w Geist, nawet w roli wyniku. Nie dodajemy trzeciego kroju ani Syncopate jako tekstu.

**The Diagonal Sets the Line Rule.** W hero strony głównej i broszur tytuł nie ma miary
ani `text-wrap: balance`, a lead jest wyrównany do prawej i dosunięty do prawego marginesu.
Wiersze wyznacza przekątna pasa. Lead wyrównany do lewej spada do stopy przekątnej i łamie
się w środku słów. Nagłówek podstron (pas przyciemniony) ma zwykły lead: 48ch, do lewej.

## Layout

Jedna kolumna treści: `min(100% − 2 × gutter, 72rem)`. Gutter to
`clamp(1rem, 4vw, 2.5rem)`. Na szerokich ekranach lewa krawędź kontenera zatrzymuje się na
24rem od krawędzi okna, żeby tytuł hero i nagłówki pod nim zaczynały się w jednej pionie.

Sekcje dzieli `spacing.6` (4rem), stopkę `spacing.7` (6rem). W blokach odstęp wynosi
`spacing.2`–`spacing.4`. Siatki kart, kroków i stopki to
`repeat(auto-fit, minmax(min(14–16rem, 100%), 1fr))`, więc kolumny składają się same, bez
breakpointów. Komponenty z własną geometrią (wstęga) używają zapytań kontenerowych, a nie
mediów: wąski układ wstęgi zaczyna się poniżej 56rem szerokości kontenera.

Oś czasu ma dwie kolumny: rok (7rem) po lewej i treść po prawej.

Broszura to stała kartka 1240 × 1754 px CSS, zrzucana przy `deviceScaleFactor: 2` do
2480 × 3508 px, ze skalą `print-step` w px (18–36).

Cele dotykowe mają przy `pointer: coarse` co najmniej 2.75rem wysokości. Nie zmieniają się
przez to odstępy w układzie myszy.

## Elevation & Depth

System jest płaski i nie używa cieni. Głębię tworzą dwa tonalne poziomy: Covert Black
pod spodem i Graphite Surface jako płaszczyzna, czasem z obwódką Divider Line. Stopka używa
dwóch płaszczyzn oddalonych o 1 px, więc dolna prześwituje jako linia, która idzie za
ukośnym cięciem. Ramka tego nie umie. Dodatkowy wymiar daje tylko folia: pas hero
przyciemniony do 25% krycia na podstronach przechodzi pod treścią.

### Named Rules

**The Flat Plane Rule.** Brak `box-shadow`, `drop-shadow` i `text-shadow`. Element
wyżej w hierarchii dostaje jaśniejszą płaszczyznę, a nie cień.

## Shapes

Jedyny ukośny kształt to cięcie pod kątem wstęgi:

- **Ścięty róg** (`.cut`, `.cut-fill::before`): prawy dolny róg wycięty na długości
  `--cut` (1.25rem), wznoszący się pod `--angle`. W kontrolkach ścina się pseudo-element
  wypełnienia, a nie sama kontrolka, bo inaczej przycięłoby to pierścień fokusu.
  Ścięte są kroki 01–03, karty projektów, pasek „Dołącz”, karty i płyta QR broszur
  (`.cut`) oraz wypełnienie przycisku głównego i wciśniętej pigułki (`.cut-fill`).
- **Znacznik nagłówka** (`.angled::before`): kreska 2.5rem × 3px pochylona `skewY` o kąt
  wstęgi, nad każdym H2.
- **Końcówka dzielnika**: linia pod wpisem osi czasu unosi się pod kątem na ostatnim
  `--cut`.
- **Ścięcie stopki**: lewy górny róg stopki z `--cut` przeskalowanym do 6rem. Kąt zostaje
  ten sam, zmienia się tylko długość.

### Named Rules

**The One Angle Rule.** Każda przekątna w systemie ma kąt `--angle` (26,17°). Długość
cięcia może rosnąć z elementem, kąt nie.

## Components

### Buttons

Precyzyjne i proste.

- **Shape:** padding 0.75em × 1.25em, waga 500.
- **Primary:** wypełnienie Chrome Silver ze ściętym rogiem na pseudo-elemencie
  (`inset: -1px`), etykieta
  w Covert Black. Hover rozjaśnia wypełnienie do Polished Highlight w 120 ms.
- **Ghost:** obrys 1px Chrome Silver, przezroczyste tło. Hover daje płaszczyznę Graphite
  Surface.
- **Focus:** obrys 2px Polished Highlight, offset 3px (globalnie dla `:focus-visible`).
- **Wejście:** wypełnienie przycisku głównego wjeżdża ścięciem naprzód (`cut-in`,
  650 ms), etykieta pojawia się po nim. Obrys przycisku-ducha rysuje się od lewej.

### Chips

- **Style:** pigułki filtra projektów mają obrys 1px Control Edge, tekst Pewter
  Muted. Hover zmienia obrys i tekst na Chrome Silver.
- **State:** wciśnięta (`aria-pressed="true"`) dostaje ścięte wypełnienie Chrome Silver i tekst
  Covert Black. Pigułki rysują się po kolei co 90 ms, a filtrowanie przesuwa karty przez
  View Transitions (360 ms).

### Cards / Containers

- **Corner Style:** ścięty prawy dolny róg (`.cut`, patrz Shapes).
- **Background:** Graphite Surface.
- **Shadow Strategy:** brak (patrz Elevation & Depth).
- **Border:** 1px Divider Line.
- **Internal Padding:** `spacing.4` (1.5rem).
- **Karta projektu:** zrzut ekranu u góry w stałym poziomym kadrze zakotwiczonym u góry
  (`aspect-ratio: 9 / 5`, najwyżej 18rem, więc na desktopie wychodzi ok. 2,2 : 1), zawsze
  w przygaszonym kolorze (40% nasycenia w pliku, krycie 0.85), przy wejściu „wywołuje się” jak
  odbitka (z szarości, jasność 2.6 i rozmycie schodzą do zera). Pod zrzutem nazwa (title), wynik w Polished Highlight, opis i stack w Pewter
  Muted, linki.
- **Krok 01–03:** ta sama płaszczyzna, numer tabularny w Pewter Muted, przy wejściu
  po górnej krawędzi biegnie 2px linia Polished Highlight i gaśnie. Krok 01 („Wchodzisz
  na Discorda”) to akcja główna: wypełnienie przycisku głównego (Chrome Silver, ścięte na
  pseudo-elemencie, hover do Polished Highlight), tekst Covert Black, opis i numer w
  mieszance 70% Covert Black (5,7 : 1), cała karta prowadzi na Discorda.

### Navigation

- **Style:** tekst Pewter Muted, ikony Lucide 1.1em obok etykiet, hover i
  `aria-current="page"` w Chrome Silver (120 ms). Bieżąca strona ma dodatkowo podkreśloną
  etykietę (2px, odsunięte o 0.3em), bo sam kolor różni ją od sąsiadów tylko o 1.13 : 1.
- **Na podstronach:** lockup Silver (3rem, na telefonie 2.1rem) prowadzi wiersz. Pas za
  nawigacją jest przyciemniony do 25%, a etykiety podnoszą się do Chrome Silver, żeby
  zachować 4.5 : 1 nad najjaśniejszymi pikselami folii.
- **Mobile:** gdzie wiersz by się złamał, każdy link staje się kolumną z ikoną nad krótką
  etykietą, w równych kolumnach. Lockup przelatuje między hero a rogiem nawigacji
  (650 ms, View Transitions).

### Opener (wstęga otwierająca)

Komponent sygnaturowy. Pas folii wchodzi lewą krawędzią dokumentu, rysuje S i wychodzi
górną albo prawą krawędzią. Nigdy nie kończy się w kadrze, poza jednym momentem animacji
wejścia. Tytuł stoi nad pasem, lead pod nim, oba opływają krawędzie folii przez
`shape-outside`. Przy pierwszym wejściu na stronę główną wstęga rozwija się wzdłuż osi
kreski S (~1,8 s), a słowo „ilver” odsłania się, gdy ramię nad nim przechodzi. Folia idzie
za kursorem (krytycznie tłumiona sprężyna) i raz błyska wzdłuż osi. Na podstronach pas
stoi przyciemniony jako tło nagłówka. W broszurze ta sama wstęga otwiera kartkę, bez
nawigacji.

### Join Strip

Pasek „Dołącz”: płaszczyzna Graphite Surface z paddingiem `spacing.5`, tekst w rozmiarze
title (46ch) i przycisk główny. Przy wejściu cały pasek rozwija się ścięciem naprzód jak
wstęga (900 ms), a po nim przycisk.

### Timeline

Wpisy w dwóch kolumnach: rok tabularny w Pewter Muted i treść z dzielnikiem Divider Line
z uniesioną końcówką. Wpis wchodzi cały pod czołem maski nachylonym jak pas, a rok kręci
się jak licznik od końca poprzedniego wpisu. Dłuższa przerwa między latami oznacza dłuższe
kręcenie.

## Do's and Don'ts

### Do:

- **Do** brać każdą przekątną z `--angle` (26,17°) i każde cięcie z `--cut`, skalując
  tylko długość.
- **Do** wyprowadzać nowe szarości przez `color-mix` srebra z czernią i mierzyć ≥ 4.5 : 1
  dla tekstu oraz ≥ 3 : 1 dla obrysu kontrolki.
- **Do** prowadzić każde wejście wzdłuż osi wstęgi (`axis-in`: od dołu i z lewej, w górę
  pod kątem) z `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Do** przy `prefers-reduced-motion` zerować przesunięcie (`--travel: 0`) i zostawiać
  przenikania, bez ukrywania treści.
- **Do** ścinać pseudo-element wypełnienia, a nie samą kontrolkę, żeby pierścień fokusu
  został cały.
- **Do** pokazywać zrzuty aplikacji z Google Play w przygaszonym kolorze, w jednym poziomym kadrze zakotwiczonym
  u góry, takim samym dla każdej karty w rzędzie.

### Don't:

- **Don't** używać barwy w interfejsie. Paleta to szarości z Covert Black i Chrome Silver.
- **Don't** używać folii poza znakiem S i pasem hero.
- **Don't** dodawać cieni. Cięcie robi `clip-path`, który i tak obcina `box-shadow`.
- **Don't** pokazywać zrzutów w kolorze ani w pionowym kadrze telefonu (paski systemowe,
  karty po 1000 px wysokości).
- **Don't** wprowadzać drugiego kąta ani łuku jako motywu.
- **Don't** używać Syncopate jako fontu tekstowego. Żyje tylko w konturach lockupu.
- **Don't** dodawać karuzel ani paralaksy.
- **Don't** kończyć pasa w kadrze. Wstęga zawsze wychodzi przez krawędź dokumentu.
