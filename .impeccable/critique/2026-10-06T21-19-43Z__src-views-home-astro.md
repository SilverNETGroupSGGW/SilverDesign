---
target: the Silver site, whole (src/views/Home.astro + /pl/projekty/, /pl/historia/)
total_score: 26
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 1
target_identity: "file:/home/ubuntu/SilverDesign/src/views/Home.astro"
target_fingerprint: "sha256:378d36cf20fb1bf17613805f711d949814912a739ddaccd4d052f46066294a40"
target_path: /home/ubuntu/SilverDesign/src/views/Home.astro
timestamp: 2026-10-06T21-19-43Z
slug: src-views-home-astro
---

⚠️ DEGRADED: single-context (run as a subagent whose caller forbade further delegation; Assessment A recorded before the detector ran, then Assessment B)

# 1. Critique — whole site (home PL/EN, /pl/projekty/, /pl/historia/, 404, brochures secondary)

Mode: **Persuade** (a WIII student who has never heard of Silver should end on Discord). Heuristics 7 and 10 scored `n/a` under the mode rule. Checked at 1440×900 and 400×860, after the hero intro and with every `[data-reveal]` scrolled in (0 of 22 left hidden; 0 hidden under `prefers-reduced-motion`).

## Design Health Score

| #         | Heuristic                       | Score     | Key issue                                                                                                                                                                                                                                                                                                                  |
| --------- | ------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1         | Visibility of System Status     | 3         | Filter has a live region and `pushState`. On sub-pages the current nav item is `--bright` against siblings in `--ink` (≈1.13:1 apart), so "you are here" is close to invisible (Opener.astro:443-450).                                                                                                                     |
| 2         | Match System / Real World       | 3         | Copy is plain and factual. But home answers the reader's three questions out of order (how → what → can I) and the result line says "Android, iOS i web" while the Platformy row below says "Android · iOS · Przeglądarka".                                                                                                |
| 3         | User Control and Freedom        | 3         | Back now undoes a filter (`pushState`, ProjectFilter.astro:97). Language switch keeps the route. No gaps that matter.                                                                                                                                                                                                      |
| 4         | Consistency and Standards       | 3         | One angle and one cut everywhere. Details drift: Geist Mono is on the language switch, step numbers, years and measured results, which the One Family Rule doesn't allow. Result line flips sans/mono per project; Discord link is sans while the mail beside it is mono; step 3's title sits 10 px higher than steps 1–2. |
| 5         | Error Prevention                | 4         | No forms, nothing destructive. The no-JS filter trap is closed (group ships `hidden`).                                                                                                                                                                                                                                     |
| 6         | Recognition Rather Than Recall  | 3         | 4 labelled nav items with icons and a lockup on sub-pages. The weak current-page cue costs a point.                                                                                                                                                                                                                        |
| 7         | Flexibility and Efficiency      | n/a       | Persuade surface.                                                                                                                                                                                                                                                                                                          |
| 8         | Aesthetic and Minimalist Design | 3         | The hero is excellent. Below it, home asks you to join four times, repeats step 2's sentence in the join strip, and `/projekty` repeats the home grid almost card for card.                                                                                                                                                |
| 9         | Error Recovery                  | 4         | 404 is bilingual, has the nav for both locales, the footer and a home link.                                                                                                                                                                                                                                                |
| 10        | Help and Documentation          | n/a       | Persuade surface.                                                                                                                                                                                                                                                                                                          |
| **Total** |                                 | **26/32** | **Good (81%)**                                                                                                                                                                                                                                                                                                             |

## Design Specificity Verdict

**Authored.** The 26.17° ribbon still drives the layout: the title and lead flow around the band, cards and buttons share its cut, and the foil appears only in the S and the band. Swap in another club's content and you would still notice it's Silver. The generic stretch is the same as last time: from the steps down, home is a stack of grey cards and left-aligned prose, and the angle survives only as 20 px corner nicks and the H2 markers.

**Deterministic scan:** `impeccable detect --json src` exited 0 with 2 advisories, both `design-system-color #000` (Opener.astro:686, base.css:215). Both are **false positives**: `#000` is the alpha stop of a `mask-image` gradient, not a painted colour. The detector saw none of the issues below, because all of them are layout, IA or rule drift.

**Visual overlays:** not attempted. The only browser available was headless scripted Playwright with no user-visible tab, and another agent was using the same server. No overlay exists.

## Overall Impression

The first viewport is among the best small-site heroes you'll see. The S, the band and "ilver" carry the brand, the title and lead face each other across the diagonal, and the two CTAs sit where the eye ends up. Every old P1 is fixed. The weak spot has moved below the fold, into the structure: home is built around "join" rather than around the student's three questions, so the reassurance ("podstawy wystarczą") turns up last, 4,600 px down (5,570 px on a phone).

## What's Working

1. **The hero holds at both widths.** At 400 px the band still exits through the left edge and the top, the lead stays right-aligned, and the CTAs stack without breaking the diagonal (`pl-home-400-fold.png`).
2. **The old debt is paid.** Sub-page nav labels are `--ink` over the band. At 200% text zoom on 400 px, scrollWidth equals clientWidth on all four pages. The filter is hidden without JS and uses `pushState`. The 404 has the nav and the footer.
3. **Copy discipline.** Every number is real and sourced, and the copy is in the present tense. The history timeline reads as a record, not marketing.

## Priority Issues

### [P1] Home answers the student's questions in the wrong order and repeats "join" four times

**What:** The section order in `Home.astro:27-60` is hero → Steps ("how to join") → Projects ("what") → JoinStrip → "Co budujemy" ("what" again) → Dołącz (where "czy dam radę" finally appears). The join strip (`pl.json join.stripProjects`) repeats step 2's sentence almost word for word. The Discord CTA appears in the hero, the strip and the Dołącz section, on top of step 1 and the nav item.
**Why it matters:** PRODUCT.md principle 1 sets the order: what will I do, can I do it, how do I join. On a phone, the threshold line that removes the main fear sits about 5,000 px down, after the visitor has already been asked to join three times.
**Fix:** Reorder to Projects (what) → Co budujemy, folded into the projects lead or cut → a threshold block with "podstawy wystarczą" → Steps (how) → Dołącz facts. Drop the JoinStrip from home, or give it the threshold line instead of the step-2 sentence.
**Suggested command:** `/impeccable layout` (with `/impeccable distill` for the copy cut)

### [P2] Geist Mono has spread past identifiers (One Family Rule)

**What:** Mono is on the language switch (`LocaleSwitch.astro:15`, the only nav item in a different face), the step numbers (`Steps.astro:14`), the timeline years (`Timeline.astro:30`) and "measured" results (`ProjectCard.astro:71`, so Charmander's result is sans while the other three are mono). Meanwhile the Discord address in the Dołącz facts (`Home.astro:55`), which is an identifier, is sans.
**Fix:** Either amend DESIGN.md to name "numerals and measurements" as a mono role, or move the switch, step numbers and results back to Geist with `tabular-nums`. Put `.mono` on the Discord `dd`. Whichever you choose, the switch must match its siblings.
**Suggested command:** `/impeccable typeset`

### [P2] Step titles don't line up across the row

**What:** At 1440 the step 3 title is at y=1127 and steps 1–2 at y=1137, with all three numbers at y=1094. Each `li` is a grid stretched to the row height, so the shorter cards spread their spare height into the gaps between rows (`Steps.astro:41-49`).
**Fix:** Add `align-content: start` to `li`, as `ProjectCard` already has.
**Suggested command:** `/impeccable polish`

### [P2] The current page is barely marked on sub-pages

**What:** `Opener.astro:443-450` lifts every label to `--ink`, and the current one only to `--bright`. That is a 1.13:1 step with no other cue.
**Fix:** Mark `aria-current` with something other than lightness, such as a 2 px underline, or the `.angled` tick under the label in the band's angle.
**Suggested command:** `/impeccable polish`

### [P2] `/projekty` adds little beyond the home grid

**What:** The same four cards, plus a three-pill filter over four items and a Platformy row that repeats the result line ("Android i iOS" / "Android · iOS"; "web" vs "Przeglądarka"). The home link "Wszystkie projekty →" promises more than it delivers.
**Fix:** Show 2–3 cards on home ("Wszystkie projekty" then means more). Drop the platforms from `result` now that the Platformy row exists, and use one word for web. Reconsider whether the filter earns its place at n=4.
**Suggested command:** `/impeccable distill`

## Persona Red Flags

**Jordan (first-year WIII student from a poster QR, on a phone):** gets a strong hero and a clear CTA. Scrolls and gets steps telling them how to join before seeing anything they'd build. "Czy dam radę" isn't answered until the last section, about 5,000 px down. Meets the same "dołączasz do projektu albo przychodzisz z własnym" sentence twice.

**Casey (mobile, one-handed):** project link targets are 39 px tall at 400 with a fine pointer, and the coarse-pointer rule raises them to 44. The filter's third pill wraps alone onto a second row (`pl-projekty-400-seg-0.png`). The "W naszej organizacji…" stack list breaks ".NET / Minimal API" across lines.

**Riley (edge cases):** filters, then presses Back, and it works. With JS off there are no pills. 200% zoom causes no overflow. Clean.

## Minor Observations

- Brochure (studenci): the threshold paragraph is justified at about 40 characters per line and shows rivers ("Udało ci się kiedyś"). It also still says "niezależnie od wydziału", the open item in PRODUCT.md.
- In the footer, "English" (mono, muted, not underlined) breaks from its siblings Discord, GitHub and Facebook, which are underlined.
- On /historia the footer's "od 2013" link points to the page you are already on.
- The 2023 history entry, "Ostatnia duża aktualizacja", is ambiguous: last, or latest?
- At 1440×900 roughly the bottom 35% of the first viewport is empty band, and nothing shows that there's more content below. This is acceptable for the hero, but a hint of the steps' H2 marker would help.

## Questions to Consider

- If home had to drop one of its four "join" moments, which one would anyone miss?
- Is mono a "data" voice (numbers, measurements) or an "identifier" voice? DESIGN.md says identifier, while the code says data.
- Should `/projekty` exist as a page, or should the home grid link straight to each project?

## Old P1s (2026-09-13 run)

| Old P1                                    | Status                                                                                                   |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Sub-page nav `--muted` over band fails AA | **Resolved**: labels are `--ink` on the `backdrop` variant (Opener.astro:443-446); the icons stay muted. |
| 200% zoom horizontal scroll on sub-pages  | **Resolved**: sw = cw = 400 on /pl/, /pl/projekty/, /pl/historia/, /en/projects/ at a 32 px root.        |
| Filter looks operable without JS          | **Resolved**: the group ships `hidden` and the script reveals it (ProjectFilter.astro:24,35).            |
| (old P2) card `sizes` upscaling           | Resolved: `sizes="(min-width: 40rem) min(50vw - 3rem, 36rem), 100vw"`.                                   |
| (old minor) 404 without nav/footer        | Resolved.                                                                                                |
