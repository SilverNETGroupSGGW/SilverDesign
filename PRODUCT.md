# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Główny:** student WIII SGGW (dawniej WZIM), który o kole słyszy pierwszy raz:
  z plakatu, z broszury, od znajomego z roku. Szuka odpowiedzi na trzy pytania,
  w tej kolejności: co tu będę robić, czy dam radę, kiedy, gdzie i jak dołączyć.
  Studenci innych wydziałów SGGW są mile widziani, ale to margines.
- **Drugi (tylko broszura „firmy”):** firma, którą koło zaprasza do warsztatu,
  prelekcji, wspólnego projektu albo wsparcia wydarzenia.
- **Trzeci, pośrednio:** uczelnia i wydział, które sprawdzają, czy koło działa.

## Product Purpose

Statyczna strona Koła Naukowego Informatyków Silver (PL/EN) i cztery broszury A4
(studenci / firmy × PL / EN) renderowane z tej samej treści.

Sukces to trzy rzeczy:

1. student wchodzi na Discorda (główne CTA);
2. firma odzywa się mailem po broszurze;
3. strona daje kołu wiarygodność wobec uczelni i wydziału: widać, że działa
   i co zbudowało.

## Positioning

Aplikacje, z których korzysta kampus (Kampus SGGW, Plan WZIM, Dni SGGW), napisali
studenci tego wydziału. Następną może napisać czytelnik. Żadne inne koło na SGGW
nie może tego powiedzieć o tych aplikacjach. Stack dobieramy pod projekt, nie
mamy listy „ścieżek”.

## Operating Context

- Koło żyje na Discordzie: projekty, ludzie, terminy. Spotkania na żywo są
  nieregularne (średnio co dwa miesiące), zwykle w sali 3/79.
- Projekty robione samodzielnie albo w małych zespołach, przez semestr.
- Broszury trafiają jako PNG 2480 × 3508 (A4, 300 DPI) na wydarzenia, do druku
  i do maili do firm; kod QR prowadzi na Discorda (studenci) albo na mail (firmy).
- Strona otwierana z telefonu po zeskanowaniu QR i z komputera po linku.

## Capabilities and Constraints

- Strona główna, `/projekty`, `/historia` w PL i EN; trasy broszur poza
  nawigacją, sitemapą i indeksowaniem. `/` renderuje polską stronę główną.
- Jedno źródło prawdy: `src/content/` (`site.json`, `copy/*.json`,
  `projects/*.json`, `history/*.json`), walidowane schematami. Zmiana faktu
  w jednym miejscu zmienia stronę i cztery PNG-i.
- Hosting statyczny (GitHub Pages), bez redirectów 30x; docelowa domena
  `silver.sggw.pl`.
- Poza zakresem: blog, aktualności, CMS, formularze, analityka, logowanie,
  Instagram (nie istnieje).
- Terminologia: wydział to **WIII (dawniej WZIM)**; „dawniej WZIM” zostaje, bo
  studenci znają starą nazwę. Aplikacja **Plan WZIM** zachowuje swoją nazwę.
  Koło: „Silver”, formalnie „Koło Naukowe Informatyków Silver”.
- **Otwarte:** broszura dla studentów mówi „niezależnie od wydziału”, a główny
  odbiorca to teraz WIII. Kopię trzeba uzgodnić z tą decyzją.

## Brand Commitments

- Nazwa i znak: lockup „Silver” (znak S + „ilver”), pliki w `brand/logo/`,
  eksport odtwarzalny skryptami, nie ręczny.
- Głos: krótkie zdania, po polsku jak do kolegi z roku. Bez korporacyjnego
  („misja”, „pasja”, „dynamiczny zespół”, „innowacyjne rozwiązania”) i bez
  nadmiernej swobody. Angielski mówi to samo, nie jest tłumaczeniem słowo
  w słowo.
- Strona główna mówi w czasie teraźniejszym. Przerwy i „reaktywacja” nie są
  tematem; daty i dawne osiągnięcia tylko w `/historia`, na głównej zostaje
  „od 2013” w stopce.
- Nie obiecujemy rytmu, którego nie ma: „terminy ogłaszamy na Discordzie”.

## Evidence on Hand

- Fakty dopuszczone na stronę: tabela w
  `docs/superpowers/specs/2026-09-11-silver-site-and-brochure-design.md` §3.
  Brak faktu = brak zdania, nie zdanie zastępcze.
- Wyniki: Kampus SGGW i Plan WZIM po 1 tys.+ pobrań w Google Play; Dni SGGW
  ponad 80 pobrań w dwa dni, 24 kody QR, 15 osób ukończyło grę; HackArena 3.0
  (marzec 2026): 4. miejsce w finale, 16. łącznie wśród 33 drużyn.
- Zrzuty ekranu: `brand/screenshots/`. Kampus SGGW i Plan WZIM ze stron w Google Play,
  Dni SGGW z wersji webowej (sggw-days.web.app); Charmander ma zamiast zrzutu prawdziwy
  fragment kodu (`brand/code/charmander/`).
- Skład: 7 osób, wyłącznie w broszurze dla firm.
- Przewodniczący: Jakub Orchowski, z imienia i nazwiska tylko w broszurze dla
  firm.
- **Nie ma i nie wolno zmyślać:** opinii, cytatów, logotypów partnerów, liczby
  członków jako argumentu („rosnąca społeczność”), stałego rytmu spotkań.
- Nazwiska dawnych członków nie pojawiają się nigdzie bez zgody danej osoby;
  wyjątek robi przewodniczący wpisem w `history/*.json`.

## Product Principles

1. Jedno pytanie czytelnika na sekcję: co robię, czy dam radę, jak dołączyć.
   Nic ponad to.
2. Twardy wynik zamiast opisu: pobrania, platformy, miejsce na hackathonie.
3. Próg wejścia mówimy wprost: podstawy wystarczą, reszty uczysz się
   w zespole.
4. Strona i broszura to jeden produkt z jednej treści; żaden fakt nie żyje
   w dwóch miejscach.
5. Koło istnieje i działa: teraźniejszość na głównej, przeszłość w historii.

## Accessibility & Inclusion

- Każdy kolor tekstu ≥ 4.5 : 1 na swoim tle.
- `prefers-reduced-motion`: nic się nie przesuwa, zostają przenikania, treść
  nie jest ukrywana.
- Lighthouse na każdej stronie w obu językach: Accessibility ≥ 95,
  Performance ≥ 95.
- Sprawdzane ręcznie przy 400 px i 1440 px, w obu językach.
