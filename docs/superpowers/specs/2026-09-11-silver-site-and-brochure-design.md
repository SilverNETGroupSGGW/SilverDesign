# Silver — strona i broszura

Data: 2026-09-11 · Status: do przeglądu

## 1. Cel i odbiorca

Strona i dwie broszury (A4, PNG) dla Koła Naukowego Informatyków Silver .NET
przy WZIM SGGW. Odbiorca główny: student SGGW, który o kole słyszy pierwszy
raz. Odbiorca drugi (tylko broszura „firmy"): firma, którą koło zaprasza do
warsztatu, prelekcji lub wspólnego projektu.

Strona odpowiada w tej kolejności na trzy pytania czytelnika: _co tu będę
robić_, _czy dam radę_, _kiedy, gdzie i jak dołączyć_. Nic ponad to.

## 2. Zasady treści

1. Strona główna mówi w czasie teraźniejszym. Koło istnieje i działa;
   przerwy i „reaktywacja" nie są tematem. Historia ma własną podstronę
   (§4.3) i tylko tam pojawiają się daty i dawne osiągnięcia; na głównej
   zostaje linijka „przy WZIM SGGW od 2013" w stopce.
2. Każdy fakt na stronie pochodzi z listy w §3. Brak faktu = brak zdania, nie
   zdanie zastępcze.
3. Nie obiecujemy rytmu, którego nie ma. Spotkania na żywo są nieregularne
   (średnio co dwa miesiące), więc strona mówi: terminy ogłaszamy na
   Discordzie, spotykamy się zwykle w sali 3/79.
4. Technologia wynika z projektu. Nie ma listy „ścieżek". Zamiast tego jedno
   szczere zdanie: dobieramy stack pod projekt i chętnie sięgamy po rzeczy
   nowe, czasem zanim będą stabilne.
5. Język: krótkie zdania, po polsku jak do kolegi z roku, bez korporacyjnego
   („misja", „pasja", „dynamiczny zespół", „innowacyjne rozwiązania") i bez
   nadmiernej swobody. Angielski: to samo, nie tłumaczenie słowo w słowo.
6. Nie wchodzi na stronę główną ani do broszur: hackathony z 2014, oś czasu
   warsztatów, daty ostatnich aktualizacji aplikacji, liczba członków jako
   argument („rosnąca społeczność"). Wszystko to może być na `/historia`.
7. Nazwiska dawnych członków (twórcy projektów, prowadzący warsztaty z
   archiwalnej strony) nie wchodzą nigdzie: to byli studenci, którzy nie
   zgadzali się na obecność na nowej stronie. Wyjątek robi przewodniczący
   wpisem do `history/*.json`, jeśli ma zgodę danej osoby.

## 3. Fakty dopuszczone na stronę

| Fakt           | Wartość                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| Nazwa          | Silver (formalnie: Koło Naukowe Informatyków Silver .NET)                                                     |
| Jednostka      | Wydział Zastosowań Informatyki i Matematyki, SGGW                                                             |
| Od kiedy       | 2013 (tylko stopka)                                                                                           |
| Sala           | 3/79, ul. Nowoursynowska 159, budynek 34, 02-776 Warszawa                                                     |
| Spotkania      | nieregularne, ogłaszane na Discordzie                                                                         |
| Skład          | 7 osób (używane wyłącznie w broszurze dla firm, jako „siedmioosobowy zespół")                                 |
| Przewodniczący | Jakub Orchowski                                                                                               |
| Discord        | `https://discord.gg/JGPZCtB` — główne CTA                                                                     |
| Mail           | `kontakt@silver.sggw.pl`                                                                                      |
| GitHub         | `https://github.com/SilverNETGroupSGGW`                                                                       |
| Facebook       | `https://www.facebook.com/silvernetgroupsggw` (tylko stopka)                                                  |
| Aplikacja      | Kampus SGGW — Android (`com.silvers.kampus_sggw_remake`) i iOS (`id1586959639`), 1 tys.+ pobrań w Google Play |
| Aplikacja | Plan WZIM — Android (`com.silvernet.silvertimetable`) i iOS (`id1384573148`), 1 tys.+ pobrań w Google Play |
| Aplikacja | Dni SGGW (`sggw_days`) — Flutter + Firebase, ukończona; aplikacja na wydarzenie Dni SGGW 2026, ponad 80 pobrań w dwa dni. Na czas wydarzenia była w Google Play, App Store i w przeglądarce; dziś tylko repo w orgu |
| Projekt        | Charmander — proxy do powiadomień push, FastAPI i .NET Minimal API, repo w orgu                               |
| Hackathon | HackArena 3.0 (SGGW, 28–29.03.2026, 33 drużyny, boty do gry wyścigowej): 4. miejsce w finałowym starciu, 16. w klasyfikacji łącznej |
| Zrzuty ekranu | `brand/screenshots/` — Plan WZIM (2) i Kampus SGGW (2), ze starej prezentacji koła |
| Stack          | dobierany pod projekt; w orgu: Dart/Flutter, C#/.NET, Python, TypeScript                                      |

### 3.1 Źródła wpisów historycznych

- Archiwum `silver.sggw.pl` (Wayback Machine): `/plan-spotkan/` (warsztaty
  2013–2019), `/projekty-aktywnosci/` (projekty), `/kontakt/`.
- Artykuł WZIM „Sukcesy Koła Silver .NET", 17.12.2014 (Wayback,
  snapshot 20.04.2015) — Teslathon i Noc Żywych Deweloperów.
- Dni Nowych Technologii na SGGW 2013 (uczelnie.net) — IT Academic Day.
- GitHub org `SilverNETGroupSGGW`: daty utworzenia i ostatnich pushy repo.
- Google Play / App Store: daty ostatnich aktualizacji aplikacji.

Źródła zostają w tym dokumencie. Na stronie nie ma linków do archiwów,
Wayback Machine ani do dawnych adresów — oś czasu i nic więcej.

## 4. Struktura strony

Jedna strona główna plus dwie podstrony, wszystkie w PL i EN.

`/` (PL) · `/en/` (EN):

1. **Hero** — znak S, jedno zdanie, kim jesteśmy i dla kogo, przycisk
   „Dołącz na Discordzie" i link „Zobacz projekty".
2. **Jak to działa** — trzy kroki: wchodzisz na Discorda → dołączasz do
   projektu albo zgłaszasz swój → robimy go w małym zespole przez semestr,
   co jakiś czas spotykając się w 3/79. Pod krokami jedna linijka o
   hackathonach z bieżącym wynikiem (HackArena 3.0, marzec 2026: 4. miejsce
   w finale).
3. **Projekty** — cztery karty (Kampus SGGW, Plan WZIM, Dni SGGW,
   Charmander) z linkami do sklepów i GitHuba; Kampus SGGW i Plan WZIM z
   prawdziwym zrzutem ekranu z `brand/screenshots/`. Karty w sklepach pierwsze,
   każda z jednym twardym wynikiem (pobrania, platformy) zamiast opisu.
4. **Technologia** — jeden akapit (zasada §2.4) i lista tego, co realnie
   jest w orgu.
5. **Dołącz** — próg wejścia jawnie („nie musisz jeszcze umieć
   programować"), Discord, mail, sala.
6. **Stopka** — kontakt, adres, GitHub, Facebook, „przy WZIM SGGW od 2013"
   (link do `/historia`), przełącznik języka.

Nawigacja: Projekty · Historia · Dołącz (kotwica) · PL/EN.

`/projekty` · `/en/projects` — te same karty rozwinięte (opis, platformy,
stack, linki), filtr _w sklepach / na GitHubie / wszystkie_.

### 4.3 `/historia` · `/en/history`

Oś czasu od 2013 do dziś, jeden wpis na wydarzenie, rok po lewej, treść po
prawej. Ton jak reszta strony: fakty, bez „dumni jesteśmy". Wpisy (źródła
w §3.1):

| Rok | Wpis |
|---|---|
| 2013 | Start koła przy WZIM SGGW. Warsztaty z Construct 2 i podstaw C# dla grupy Junior Silver .NET. |
| 2013 | IT Academic Day — dzień konferencji Dni Nowych Technologii na SGGW zorganizowany przez koło (Aula Kryształowa). |
| 2014 | 1. miejsce na Teslathonie (36 h) — system wyborczy na wybory parlamentarne. 3. miejsce wśród ~100 drużyn .NET z Polski na Nocy Żywych Deweloperów (24 h, dziewięć aplikacji). W jury Predica, Microsoft, Vizao. |
| 2014–2015 | Warsztaty: Windows Phone 8.1, Unity3D, Akademia C#. Pierwsza wersja aplikacji Kampus SGGW (kwiecień 2015). |
| 2015 | Organizacja koła na GitHubie. Portal dla kół naukowych „Wokół", aplikacja Giełda Pomysłów. |
| 2016–2018 | Warsztaty: programowanie obiektowe, C#/.NET, Android, Unity, ASP.NET MVC, zaawansowany C#, SFML. |
| 2018 | Aplikacja Plan WZIM — plan zajęć WZIM w telefonie, powiadomienia o zmianach, widok dla prowadzących. |
| 2019 | Warsztaty Unity i Flutter zakończone projektami; gra platformowa STEAMY (2D, siedmioosobowy zespół, własna grafika i muzyka). Od tego roku Flutter jest w kole na stałe. |
| 2021–2022 | Warsztaty z Gita i GitHuba (repozytoria w orgu). Kampus SGGW od nowa, we Flutterze, w Google Play i App Store. |
| 2023 | Plan WZIM — ostatnia duża aktualizacja. |
| 2026 | HackArena 3.0 (marzec): 4. miejsce w finałowym starciu, 16. w klasyfikacji łącznej wśród 33 drużyn. Aplikacja Dni SGGW — ponad 80 pobrań w dwa dni wydarzenia. Charmander, proxy do powiadomień push. |

Oś kończy się bieżącym rokiem; nie ma wpisu „przerwa" ani „powrót" — luka
między latami mówi sama za siebie, czytelnik nie potrzebuje komentarza.

Broszury (§7) mają własne trasy, wyłączone z nawigacji, sitemapy i
indeksowania.

## 5. Kopia — szkice kluczowych linii (PL, do zatwierdzenia)

Hero:

> **Koło naukowe informatyków na SGGW.**
> Piszemy aplikacje, z których korzysta kampus — i uczymy się na nich więcej
> niż na zajęciach.

Projekty (wstęp):

> Dwie z naszych aplikacji są w sklepach i mają po ponad tysiąc pobrań.
> Reszta jest na GitHubie.

Technologia:

> Nie mamy jednego stacku. Dobieramy narzędzia pod projekt i chętnie
> sięgamy po nowe rzeczy — czasem zanim ktokolwiek uzna je za stabilne.

Dołącz:

> Nie musisz jeszcze umieć programować. Wystarczy, że chcesz coś zbudować.
> Wejdź na Discorda, przedstaw się, wybierz projekt.

Wersje EN powstają przy implementacji według §2.5.

## 6. Model treści

Jedno źródło prawdy w `src/content/`, walidowane schematami Zod przez
kolekcje Astro:

- `copy/pl.json`, `copy/en.json` — wszystkie teksty interfejsu i sekcji.
  Jeden schemat dla obu plików; brak klucza w którymkolwiek = błąd builda.
- `projects/*.json` — `id`, `name`, `status` (`store` | `github`),
  `platforms`, `links` (`play`, `appStore`, `github`), `tech[]`,
  `summary.pl`, `summary.en`.
- `site.json` — nazwa, adres, sala, Discord, mail, GitHub, Facebook, rok.
- `history/*.json` — `year` (albo `yearFrom`/`yearTo`), `title.pl/en`,
  `body.pl/en`. Bez linków: oś czasu nie prowadzi nigdzie.

Broszury czytają te same pliki. Zmiana faktu w jednym miejscu zmienia
stronę i cztery PNG-i.

## 7. Broszury

Dwie wersje × dwa języki = cztery PNG-i:

| Trasa                    | Plik                                    |
| ------------------------ | --------------------------------------- |
| `/broszura/studenci`     | `dist/brochure/silver-studenci-pl.png`  |
| `/broszura/firmy`        | `dist/brochure/silver-firmy-pl.png`     |
| `/en/brochure/students`  | `dist/brochure/silver-students-en.png`  |
| `/en/brochure/companies` | `dist/brochure/silver-companies-en.png` |

Format: A4 pionowo, **2480 × 3508 px** (300 DPI). Strona broszury ma stałe
wymiary **1240 × 1754 px CSS**; Playwright robi zrzut przy
`deviceScaleFactor: 2`, co daje dokładnie wymagany rozmiar. Kolory jak na
stronie (ciemne tło); wersja do druku na czarnym tle to decyzja świadoma —
broszura ma wyglądać jak strona, nie jak ulotka z drukarki wydziałowej.

Wersja **studenci**: hero, „jak to działa", dwie aplikacje ze sklepów, próg
wejścia, kod QR do Discorda, sala i mail.

Wersja **firmy**: kim jesteśmy (siedmioosobowy zespół przy WZIM SGGW), co
zbudowaliśmy (aplikacje w sklepach, projekty w orgu), co możemy zrobić razem
(warsztat lub prelekcja dla studentów w sali na WZIM, wspólny projekt,
wsparcie wydarzenia), kod QR do maila, przewodniczący z imienia i nazwiska.

QR generowany przy buildzie do SVG (pakiet `qrcode`), bez usług zewnętrznych.

Skrypt `bun run brochure`: buduje stronę, uruchamia Chromium przez
Playwright, zrzuca cztery trasy, sprawdza wymiary każdego PNG-a i kończy się
błędem, jeśli którakolwiek broszura ma przewijanie (treść wystaje poza
kartkę).

## 8. Kierunek wizualny

Od zera; z poprzedniego systemu nic nie wraca.

- **Kolory**: tło `#16161B` (Covert Black), tekst i akcent `#D8DBDE` (Chrome
  Silver). Kolory pochodne (tekst drugorzędny, linie, powierzchnie kart)
  wyprowadzane z tych dwóch; każdy kolor tekstu mierzony ≥ 4.5 : 1 na swoim
  tle. Żadnej barwy poza szarościami.
- **Tekstura**: `brand/foil-texture.jpg` wyłącznie wewnątrz znaku S i w
  jednym elemencie hero (pas). Nigdzie indziej.
- **Logo**: `brand/logo/mark.svg` i `mark-transparent.svg` eksportowane z
  konfiguratora z ustawieniami z §11 skryptem `bun run logo:export`
  (Playwright uruchamia `logo-configurator.html`, wczytuje JSON ustawień,
  zapisuje SVG). Eksport odtwarzalny, nie ręczny.
- **Motyw**: jedna przekątna w całym systemie — kąt pasa w wyeksportowanym
  SVG. Cięcia kart, podkreślenia i pas w hero używają tego kąta i żadnego
  innego.
- **Typografia**: jedna rodzina zmienna, self-hosted woff2, subsety latin +
  latin-ext (polskie znaki), licencja OFL: **Geist** do wszystkiego, **Geist
  Mono** wyłącznie do metadanych (identyfikatory pakietów, adres). Pliki w
  `public/fonts/` z licencją obok.
- **Ruch**: jedna interakcja — tekstura w znaku S przesuwa się o kilka
  procent za kursorem. Wyłączona przy `prefers-reduced-motion`. Żadnych
  animacji na scroll, żadnych karuzel.

## 9. Stack i narzędzia

- **Astro 5**, wyjście statyczne, wbudowane i18n: `defaultLocale: "pl"`,
  `locales: ["pl", "en"]`, PL bez prefiksu, EN pod `/en/`. `<html lang>`,
  linki `hreflang`, przełącznik zachowuje bieżącą podstronę.
- **TypeScript** — `tsconfig` rozszerza `astro/tsconfigs/strictest`.
- **Bun** jako runtime, menedżer pakietów i test runner.
- **oxlint** + **oxfmt** — jedyne narzędzia lint/format; brak ESLint i
  Prettier.
- **mise** — `mise.toml` przypina wersję Buna; `mise run` udostępnia
  zadania `dev`, `check`, `test`, `build`, `brochure`, `logo:export`.
- **Playwright** (Chromium) — eksport logo, broszury, test wymiarów.
- **qrcode** — kody QR do SVG.
- Zero frameworka UI. Interaktywność w plain TypeScript, łącznie < 20 KB JS.
- **Hosting**: GitHub Pages z GitHub Actions (`mise` → `bun install` →
  check → test → build → deploy). Domena w jednym polu `site` w
  `astro.config`; docelowo `silver.sggw.pl`, do czasu podpięcia
  `silvernetgroupsggw.github.io`.

Układ repo: aplikacja w korzeniu tego repozytorium; `logo-configurator.html`
i `brand/` zostają, gdzie są.

## 10. Weryfikacja

- `astro check` — zero błędów typów, także w plikach `.astro`.
- `oxlint` — zero ostrzeżeń.
- `bun test`:
  - oba pliki `copy` przechodzą ten sam schemat;
  - każdy projekt ze `status: "store"` ma co najmniej jeden link do sklepu;
  - `site.json` ma wszystkie pola z §3;
  - każdy wpis `history` ma rok w zakresie 2013–bieżący.
- `bun run brochure` — cztery PNG-i, każdy dokładnie 2480 × 3508, brak
  przewijania.
- Lighthouse na `/`: Performance ≥ 95, Accessibility ≥ 95, każda strona w
  obu językach.
- Ręcznie w Chrome przed oddaniem: 400 px i 1440 px, oba języki, tryb
  `prefers-reduced-motion`.

## 11. Ustawienia logo (dla `logo:export`)

```json
{
  "scale": 0.74,
  "neck": 8,
  "entryH": 87,
  "waistTilt": 40,
  "waistH": 150,
  "lineWidth": 50,
  "bandWidth": 136,
  "slopeLen": 168,
  "slopeStart": 94,
  "slopeCurve": 100,
  "slopeRound": 20,
  "lean": -0.9,
  "zoom": 2,
  "brightness": 1,
  "bg": "#16161b",
  "ink": "#d8dbde",
  "solidColor": false,
  "texX": -44,
  "texY": 0,
  "texMirrorX": true,
  "texMirrorY": true,
  "transparent": false
}
```

## 12. Poza zakresem

Blog, aktualności, CMS, formularze, analityka, panel logowania, wersje
broszury do druku jednobarwnego, Instagram (nie istnieje).
