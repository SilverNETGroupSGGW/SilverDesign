---
target: the Silver site (src/components/Opener.astro)
total_score: 26
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
target_identity: "file:/home/ubuntu/SilverDesign/src/components/Opener.astro"
target_fingerprint: "sha256:57bd01fc933bcf999c5e466d7673ac1f660f58c594b79cb2c02ad4afa3eee90a"
target_path: /home/ubuntu/SilverDesign/src/components/Opener.astro
timestamp: 2026-09-13T08-18-55Z
slug: src-components-opener-astro
---

# 1. Critique

## Design Health Score

Mode: **Persuade** (the surface's job is to turn a student who has never heard of Silver into
someone who opens the Discord invite). Heuristics 7 and 10 are scored `n/a` under the mode rule.

| #         | Heuristic                       | Score     | Key issue                                                                                                                                                                                                                             |
| --------- | ------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1         | Visibility of System Status     | 3         | Filter announces itself well (`aria-pressed`, `role="status"` live region, URL state); with JS off the same controls still claim "Wszystkie" is pressed and nothing responds.                                                         |
| 2         | Match System / Real World       | 4         | Copy is plain student Polish/English, facts only, no corporate register; routes and the filter query string are localised (`?filtr=sklep` / `?filter=store`).                                                                         |
| 3         | User Control and Freedom        | 3         | Language switch keeps the route; filter is reversible — but `history.replaceState` means Back cannot undo a filter (`ProjectFilter.astro:55`).                                                                                        |
| 4         | Consistency and Standards       | 3         | One angle, one cut, one family, used everywhere. Against that: the lead's script indents sub-page leads at some widths and not others; `var(--space-1)` is not a token; home and sub-page openers are now two different compositions. |
| 5         | Error Prevention                | 3         | No forms, nothing destructive. The one trap is a shared `?filtr=` link that silently shows everything when JS is off.                                                                                                                 |
| 6         | Recognition Rather Than Recall  | 3         | 4 nav items, current page marked with `aria-current` and ink; the lockup heads the bar and links home. On the home page the wordmark exists only inside the artwork, so the top-left corner carries no brand anchor.                  |
| 7         | Flexibility and Efficiency      | n/a       | Persuade surface: one path, no power-user affordances to grade.                                                                                                                                                                       |
| 8         | Aesthetic and Minimalist Design | 4         | The ribbon composition is authored, not templated; greys only; one motion. Deductions are edge-width craft, not clutter.                                                                                                              |
| 9         | Error Recovery                  | 3         | The 404 is bilingual, on-brand and offers both home pages — but it drops the navigation, the footer and the skip link, so a lost visitor's only move is "home".                                                                       |
| 10        | Help and Documentation          | n/a       | Persuade surface; no documentation layer is in scope.                                                                                                                                                                                 |
| **Total** |                                 | **26/32** | **Good — address the weak dimensions**                                                                                                                                                                                                |

Applicable maximum 32 (heuristics 7 and 10 scored `n/a`). 26/32 ≈ 81 %.

## Design Specificity Verdict

**Authored, not interchangeable.** Strip the copy out and this is still recognisably one product:
the 26.17° ribbon is not decoration, it is the layout engine — the title's lines end on the band's
upper edge, the lead's lines start on its lower edge, the card corners, the section markers, the
footer edge and the filter pills all cut at the same angle, and the foil lives only inside the
mark. Nothing here could be dropped onto an unrelated product without being noticed. The one place
the system reads as generic is the body of the pages below the opener: a plain two-column card grid
and a plain year/entry timeline, where the diagonal survives only as a 20 px corner nick.

**Deterministic scan** — `impeccable detect --json src` on the assessed revision returned:

```json
[]
```

Exit 0, clean, with two documented value-ignores in `.impeccable/config.json` (Geist, Geist Mono,
both pinned by spec §8). The detector found nothing the eye missed and produced no false positives
to discount. It also does not see any of the three P1s below — all three are runtime properties
(composited contrast, zoomed reflow, script-induced layout), which is why the browser pass matters.

**Visual overlays:** not attempted. No mutable-injection browser tool was exposed to this context
beyond scripted Playwright; the overlay/`live-server` flow was skipped and replaced by the
screenshot + pixel-sampling evidence listed above. No user-visible overlay exists.

## Overall Impression

This is the rare small site where the identity and the layout are the same object. The hero at
1440–2560 is genuinely good work (`shots/hero-pl-2560.png`): the foil band carries the wordmark
through the viewport, the title and the lead face each other across it, and the copy underneath
says exactly three things and stops. The craft debt is concentrated where the band meets small
text and small screens — the new top bar puts `--muted` links straight onto the brightest part of
the band, 200 % zoom pushes the band's box past the page on phones, and the script that shapes the
lead does 375 forced layouts per pass on every page including the ones it is supposed to skip.

The single biggest opportunity: **the band is now behind content, so it has to earn its brightness
per surface.** One rule — "the band never sits behind text lighter than `--ink` above X %" — would
close the AA failure, the reflow bug and the visual noise in the bar at once.

## What's Working

1. **One diagonal, derived, not drawn.** `geometry.json` → `opener.ts` → `calc()` means the band,
   the shape polygons and the tests read the same numbers; `tests/opener.test.ts` pins the exits at
   six widths. Zero media queries in the opener and still no horizontal overflow anywhere from 320
   to 2560 at default zoom (63 measured runs, `metrics.json`).
2. **The copy keeps its promises.** Present tense, facts with sources, no "pasja"/"dynamiczny
   zespół", the entry bar stated out loud ("Nie musisz jeszcze umieć programować"), and every hard
   number is a real one. The `mono` face is reserved for identifiers and addresses, exactly as
   spec §8 says.
3. **Accessibility groundwork is real, not ceremonial.** Skip link that lands on `h1#main`,
   `aria-current="page"`, a `role="status"` live region that reports "2 z 4 projektów", per-locale
   `lang`/`hreflang` (including `x-default`), alt text that names the app, and a focus ring that was
   deliberately given a `--bg` halo so it survives crossing the foil
   (`shots/focus-tab2-pl-home-1440.png`). Lighthouse mobile accessibility is 100 on all four pages.

## Priority Issues

### [P1] The navigation's `--muted` links sit on the band and fail AA

**What:** On all four sub-pages the dimmed band (`opacity: .25`) passes behind the navigation row.
Sampling only the pixels a glyph fully covers, the language switch and — at 768 px — "Dołącz"
measure **3.90–4.34 : 1** against 4.5 : 1 (WCAG 1.4.3 AA, 16–18 px text).

| page          | width | link      | worst      | background under the glyph           |
| ------------- | ----- | --------- | ---------- | ------------------------------------ |
| /pl/projekty/ | 1024  | "English" | **3.90:1** | rgb(62,63,69), 21 of 46 px below 4.5 |
| /pl/projekty/ | 768   | "Dołącz"  | **3.96:1** | rgb(61,62,68), 21 of 51 px below 4.5 |
| /pl/historia/ | 400   | "English" | **4.15:1** | rgb(58,59,65), 22 of 23 px below 4.5 |
| /en/projects/ | 768   | "Polski"  | **4.20:1** | rgb(58,58,64), 12 of 26 px below 4.5 |

12 link/width combinations fail across the four pages (`nav-contrast.json`); every failure is the
language switch or "Dołącz", i.e. the two controls a lost or non-Polish visitor needs most. Body
copy further down is safe (worst 6.17 : 1, `bodyband.ts`), so this is strictly the bar.
**Why it matters:** low-vision users lose the language control; on a phone in daylight everyone
does. The owner's ruling was that the band _may pass behind the links_ — it did not rule that the
links may become unreadable.
**Fix:** any one of — `--ink` for `nav a` on the `page` variant (measured ≥ 13 : 1 over the same
pixels); or drop the band to `opacity: .18` (computed ceiling for 4.5 : 1 against `--muted` at the
brightest sampled foil pixel); or route the band's horizontal run below the row. Smallest is the
first.
**Evidence:** `shots/navband-768.png`, `shots/navband-1440.png`, `shots/navworst-768.png`,
`nav-contrast.json`. **Suggested command:** `/impeccable harden`

### [P1] 200 % text zoom on a phone scrolls the sub-pages sideways

**What:** At 400 × 900 with a 32 px root font, `/pl/projekty/`, `/pl/historia/`, `/en/projects/`
and `/en/history/` report `scrollWidth 516` against `clientWidth 400` — 116 px of horizontal
scroll. The culprit is `svg.ribbon` (absolute, `--m` wide, right edge 516 px): `.backdrop` trades
`overflow: hidden` for `overflow: visible` + `clip-path: inset(0 0 -200vh 0)`, and a clip path
hides the paint without removing the box from the scrollable overflow region.
**Why it matters:** WCAG 1.4.10 Reflow is an AA requirement; two-dimensional scrolling of running
text is precisely what it forbids. The home page is unaffected (it still clips), so this is a
regression introduced with the top bar this morning.
**Fix:** keep the visual effect and restore the containment — put `overflow-x: clip` on `.frame`
(or on the header) alongside the clip path, or give the band its own clipped wrapper.
**Evidence:** `shots/overflow-pl-projekty-400-root32.png`, `shots/zoom200-projekty-400.png`,
`overflow.ts` output, `metrics.json` (four runs flagged `hOverflow`).
**Suggested command:** `/impeccable adapt`

### [P1] The projects filter looks operable without JavaScript and is not

**What:** With JS disabled the three pills render, "Wszystkie" still carries `aria-pressed="true"`,
and clicking "W sklepach" changes nothing: 0 of 4 cards hidden, no URL change, no message. A shared
deep link `?filtr=sklep` renders all four cards with the wrong pill pressed
(`behaviour.json → noJsFilter`).
**Why it matters:** three controls that answer nothing is worse than no controls; the pressed state
is a lie a screen reader will read out, and a pasted filter URL misrepresents the page.
**Fix:** ship the group hidden and let the script reveal it (`hidden` on the wrapper, removed in
`ProjectFilter.astro`'s script), or render the pills as real links to `?filtr=…` and let the script
upgrade them to buttons. Either keeps the enhanced experience identical.
**Evidence:** `shots/nojs-pl-projekty-1440.png`, `shots/nojs-filter-click-1440.png`,
`shots/filter-github-1440.png` (working, with JS). **Suggested command:** `/impeccable harden`

### [P2] The lead's line script edits pages it is documented not to touch — and costs 300 ms

**What:** `wedge.ts` is meant to stair-step the lead beside the diagonal and "change nothing on
sub-pages and wherever there is no float" (HANDOFF). It does change them: its score function
charges one line-height per line even when every line starts at the same left edge, so a
left-aligned sub-page lead gets a first-line `text-indent` — 28.8 px at 320, 24.5 px at 400,
38.4 px at 768, 70.4 px at 1440/200 % — on `/pl/projekty/`, `/en/projects/` and `/en/history/`,
but not on `/pl/historia/` (its lead fits one line). The result is an indent that appears and
disappears across widths and languages with no rule behind it.
The same pass is expensive: up to 5 × 3 × 25 = 375 style-write/`getClientRects()` pairs per lead —
a textbook forced-synchronous-layout loop. Measured at 4× CPU throttling on `/pl/projekty/` @400:
a **339 ms long task** after `fonts.ready`, and **302 ms** of blocking per `resize`
(`/pl/historia/`: 3 ms, because it returns early). This is most of the 180 ms TBT that pulls that
page's Lighthouse performance to 92.
**Fix:** return early when the lead has no shaped float beside it (no `shape-outside` on the zone's
float, or simply skip `backdropVariants`), and bound the search — measure once per candidate width
instead of walking 25 indents, or binary-search the indent.
**Evidence:** `metrics.json` (`leadInfo.indent` per run), `perf.ts` output.
**Suggested command:** `/impeccable optimize`

### [P2] Card screenshots are upscaled on every desktop width

**What:** `ProjectCard.astro:63` declares `sizes="(min-width: 60rem) 420px, …"`, but at ≥ 60rem the
2-column grid gives each card **633 px** at 1440 (measured `imgs[].w` vs `naturalWidth` 420 in
`metrics.json`). The browser therefore picks the 420 w candidate and stretches it by 1.5×; the
840 w candidate that exists in the build is never used above the phone breakpoint.
**Why it matters:** the two store apps are the page's proof, and their proof is visibly soft.
**Fix:** make `sizes` describe the real grid — e.g.
`(min-width: 40rem) min(50vw - 3rem, 36rem), 100vw` — and keep the 840 w candidate.
**Evidence:** `shots/pl-projekty-1440.png` (Plan WZIM tile), `metrics.json`.
**Suggested command:** `/impeccable optimize`

## Persona Red Flags

**Jordan (first-timer — the spec's primary reader, a student who has never heard of Silver).**
Lands on `/pl/`, reads the hero, sees "Dołącz na Discordzie". That path is clean and short. Two
snags: at 320 px the language switch wraps onto its own line and lands directly above the headline
(`shots/hero-pl-320.png`), so it reads as a kicker to "Koło naukowe informatyków", not as a
control; and the only thing naming the club in the top-left corner of the home page is the artwork,
so a visitor who scrolls past the hero has no persistent brand anchor until the footer.

**Alex (returning member / power user).** Filters `/pl/projekty/` to "Na GitHubie", copies the URL —
fine with JS. Presses Back expecting the filter to lift: nothing happens
(`history.replaceState`, `ProjectFilter.astro:55`). Sends the link to a colleague whose browser
blocks scripts: they see all four projects and a pill that claims otherwise.

**Sam (low vision, 200 % browser zoom, Android phone).** Opens `/pl/projekty/`: the page now
scrolls sideways 116 px and the language switch sits at 3.9 : 1. Both of Sam's two needs — reflow
and contrast — fail on the same screen.

## Minor Observations

- `var(--space-1)` (`Opener.astro:340`) is not defined in `tokens.css` (the scale starts at
  `--space-2`), so the phone-width rule that should tighten the gap after the lockup is dropped as
  invalid at computed-value time and silently does nothing.
- On the sheets the `h1`'s accessible name is `"SilverKoło naukowe informatyków na SGGW"` — the
  visually-hidden brand span (`Opener.astro:132`) is concatenated without a separator.
- At 2560 the opener's column stops at 24 rem (`opener.ts:405-410`) while `.container` keeps
  centring on 72 rem, so the hero title starts ~320 px left of every heading below it
  (`shots/hero-pl-2560.png`). The HANDOFF records this as an open owner decision with the fix
  named (cap `.container` at the same 24 rem).
- The 404 has no navigation, no footer and no skip link; "GitHub" appears as the link text of three
  different destinations on `/pl/projekty/`; cards in a row still end at different heights when one
  has a screenshot and the other does not.
- `/` is an unstyled meta-refresh page (`src/pages/index.astro`): no `color-scheme`, no CSS, so a
  slow load shows a white page with a default-blue link inside an otherwise all-dark site.
- No `sitemap.xml` is emitted, although spec §4 speaks of excluding the brochures from one.
  Brochure routes do carry `noindex, nofollow`, and the 404 carries `noindex, follow` — correct.

## Questions to Consider

- The band now runs _behind_ content instead of being clipped to the header. What is the rule for
  what may sit on it — is `--muted` ever allowed on the band, or is the band always below ink?
- The sub-page opener and the home opener are now two different compositions (top bar vs. shaped
  columns). Is that two expressions of one idea, or two ideas?
- The lead's stair-step is invisible to most readers and costs 300 ms per resize. If it were cut
  entirely, what would be lost that anyone would name?

---
