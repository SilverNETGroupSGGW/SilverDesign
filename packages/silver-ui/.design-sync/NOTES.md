# design-sync notes — @silver/ui

Repo-specific gotchas. Read this before re-syncing.

## Toolchain

- The package is built with **Vite+** (`vp pack`, tsdown under the hood), run through **Bun**.
  `bun install` then `bun run build`. There is no npm lockfile — `bun.lock` is the lockfile.
- `vp pack` emits **`index.mjs` / `index.d.mts`**, not `.js`/`.d.ts`. Consequences:
  - `package.json` `exports`/`types` point at the `.mjs`/`.d.mts` names. If you change the pack
    `format`, fix those too or consumers resolve nothing.
  - The converter's `[DTS]` stage reports **`parsed 0 .d.ts files from dist`** — it globs `*.d.ts`
    and the shipped types are `.d.mts`. It then falls back to scanning `srcDir` and produces
    correct props for all 18 components, so this line is **expected, not a failure**. If prop
    extraction ever regresses, the fix is to emit `.d.ts` alongside, not to chase the glob.
- `vp check` runs format + lint + full type-check. It must pass before a build is shipped.
  `dist/`, `node_modules/`, `.ds-sync/`, `ds-bundle/`, `demo/bundle.js` and the generated
  `src/logo-paths.ts` are in `lint.ignorePatterns` / `fmt.ignorePatterns` in `vite.config.ts` —
  without `.ds-sync/**` there, `vp check` lints the staged converter and reports ~100 errors that
  are not this repo's.

## CSS wiring (the part that took the longest)

- Tokens live in **`../../brand/tokens.css`**, shared with the print templates. They are NOT in a
  separate npm package, so **`cfg.tokensGlob` does not work** — `copyTokens()` returns early
  unless `cfg.tokensPkg` is set, and it resolves under `node_modules/<pkg>`, which does not exist
  for a package's own repo. Setting only `tokensGlob` silently ships an empty `tokens/` and
  validate reports `[TOKENS_MISSING]` for 28 properties.
- The fix: `scripts/bundle-css.mjs` generates **`dist/ds.css`** — tokens + components flattened
  into one file — and `cfg.cssEntry` points at it. The converter copies `cssEntry` verbatim
  without resolving `@import`, so a chain would arrive dangling.
- That generated file also **drops the `@import url('fonts/fonts.css')` line** — design-sync
  ships fonts itself via `cfg.extraFonts`.
- `dist/styles.css` (the `@import` chain) is what normal npm consumers import. `dist/ds.css` is
  its flat twin for design-sync only. Both must stay in sync — they are generated from the same
  two sources, so they do by construction.

## Provider

- `cfg.provider` is **`SilverProvider`** and is required. Without it every preview renders on
  white with no tokens: the components read all colour, type and spacing from custom properties
  that this component puts on the DOM.

## Known render warns

There are currently **none** — validate exits clean with zero warnings. Two were resolved:

- `[GRID_OVERFLOW]` on **Foil** and **Heading** → fixed with `cfg.overrides.<Name>.cardMode:
"column"`. Keep those overrides; the stories are genuinely wider than a grid cell.
- `[RENDER_THIN]` on EventCard and Stat → disappeared once their previews were authored.

If a warn appears that is not listed here, it is new. Look at it before recording it.

## Component fixes the previews exposed

Worth knowing because they were real bugs, not preview problems:

- **Button had no `:disabled` styling** — a disabled button looked identical to an enabled one.
- **`RibbonBackdrop` anchored with `top: -34%`**, a percentage of the _container's height_, while
  sizing by width. In a short wide hero that pushed the S far below the frame and left only a
  grey triangle. Now anchored with `transform: translate()`, whose percentages resolve against
  the tile's own size, so placement is aspect-independent.
- **`.sv-ribbon--top-left` used `scaleX(-1)`**, mirroring the logo. Removed — a flipped logo is a
  wrong logo.

## Design changes (second pass)

Four things changed after the first sync; they are all in `brand/tokens.css` and
`src/components.css` unless noted:

- **Contrast.** `--muted` and `--dim` were failing WCAG AA (`--dim` was 2.66 : 1 on Slate, below
  even the 3.0 large-text floor). They are now 7.1 and 4.6 against Slate, the lightest ground
  text ever sits on. The header block in `tokens.css` records the measured ratios — re-measure
  before darkening either.
- **Rounded.** `--radius: 0` contradicted a mark made entirely of curves. There is now a radius
  scale, and `Card`'s signature corner is a wide `border-bottom-left-radius` sweep instead of the
  old sharp `clip-path` wedge. The `.cut-27` utility became `.sweep`.
- **One shared foil sheet.** Foil elements no longer each paint their own gradient. They all use
  `background-attachment: fixed` plus the same `--foil-sheet` size and position, so they sample
  one continuous sheet and vary by _where they sit_. `--foil-sheet` is in **px on purpose** — in
  `vmax` the metal changes character when the window is resized. 1400px is tuned: much larger and
  every element samples a near-uniform slice and the foil goes flat white (that happened at
  220vmax). `SilverProvider drift` animates `--foil-drift` once on the root.
- **The wordmark's S is now the mark itself** — the knot plus a 30-unit stub of its bands, set by
  `STUB` in `tools/silver_wordmark.py`. Running the bands full length swamps the word; cutting
  them off entirely leaves an S that merely resembles the logo. An alternative was tried and
  rejected: substituting the whole square tile for the S made the word read as "ILVER".

## Consequences of the shared sheet (not bugs)

- **`ramp="bright"` often looks identical to `ramp="default"`.** The two ramps differ at their
  dark end, and which part of a ramp an element shows depends on where it sits on the sheet — so
  at most positions both land on their bright region. `bright` is a legibility _guarantee_ for
  small text wherever it lands, not a visibly different finish everywhere. The `Foil` preview's
  `Ramps` cell demonstrates it at the size where it matters and says so in its own copy.
- **Preview cards show uniform foil.** Each DS-pane card is its own viewport, so every card
  samples the same slice of the sheet. Variation between elements only appears when several share
  one page — the demo gallery shows it, the cards cannot. Do not "fix" this.
- **`background-attachment: fixed` is ignored by some mobile browsers** (iOS Safari treats it as
  `scroll`). There the foil falls back to per-element gradients, which is a graceful degradation,
  not a break — every element still shows metal, just its own slice.

## If you ever put a `url()` in a custom property

Two bugs shipped from this once, both silent. `url()` inside a custom property resolves
against the **document**, not the stylesheet that declares it, so a relative path fails to
paint on every page that is not a sibling of the CSS — and nothing errors. Inline it as a
data URI instead. And terminate it with a `;`: without one it merges with the next line and
kills that token too, which looks exactly like "the effect is too subtle".

## Drift

- `40s` for `1100px` of travel across a `1400px` sheet — roughly a tenth of the ramp every five
  seconds. The first attempt (600px / 90s) was ~7px/s and looked completely static; if someone
  reports "the background does not move", check the rate before checking the mechanism.
- It is **on by default** in `SilverProvider` and enabled in `cfg.provider.props.drift` so the
  DS-pane previews animate too. Disabled under `prefers-reduced-motion`.

## The wordmark's ILVER is Figtree, outlined

- `tools/wordmark_font.py` converts ILVER from `tools/fonts/figtree-600-latin.woff2`
  into outlines at build time. The logo therefore carries **no font dependency** —
  nothing to load, nothing to shift if a webfont fails.
- **Figtree was chosen on measurements, not vibes.** Its stem is 0.166 of cap height,
  identical to the S's stroke, so the two sit together with no weight adjustment; its
  O is 0.97 wide-to-tall — soft without being a circle; terminals are cut flat.
- **Cap height, not font-size, is what matches.** `font-size` is the em and cap height
  is only ~0.70 of it, differing per family. The generator scales by the font's own
  `OS/2.sCapHeight` (falling back to measuring the flat top of a capital I). Sizing the
  S to a font-size instead leaves the S visibly taller — that bug shipped once.
- **Never place letters in per-letter `<g transform>`.** A `userSpaceOnUse` gradient
  resolves in the user space where it is referenced, ancestor transforms included, so
  each transformed letter samples the gradient from its own origin and the foil reads
  as applied letter by letter. All transforms are baked into the path data and the
  wordmark is a single `<path>`. The outer padding is a negative viewBox origin for
  the same reason.
- **Do not flatten glyph curves to polygons.** An earlier version composed the word in
  shapely; sampling curves then unioning notched the straight-sided letters and holed
  the R. Outlines stay native SVG path data.
- Licence: Figtree is OFL-1.1 — see `tools/fonts/NOTICE.md`. It is a build input only
  and is not redistributed in any shipped artifact.

## There is exactly one S

The S in the wordmark, in both lockups, in the icon crop and in the mark is **one
shape**: `silver_logo.mark_geometry()` built from the committed config, rotated
upright by the brand angle and cropped. Rotation is rigid, so the curve is
untouched; only the band length differs.

This regressed once and shipped: a second code path (`glyph_S_plain`, built from
`spine()` rather than `build()`) used `scale: 0.50` against the config's `0.63`, so
both lockups carried a visibly different letter from the logo and nothing caught it.
That path is deleted — there is one `glyph_S`, and `plain_s` no longer exists.

`build_logo.verify_s_is_the_mark()` runs on **every build**: it rebuilds the expected
letter independently from `mark_geometry()` at the committed config and fails the
build if it differs from what `silver_wordmark` produces. Verified to catch the
original bug — reintroducing `scale: 0.50` exits 1 with "55.465% of its area differs".

`logo/silver-s.svg` is that shape as its own asset; the library exports it as
`S_PATH` / `S_VIEWBOX`. Take it from there rather than rebuilding it.

## PNGs are rasterised from the SVGs

`build_pngs()` screenshots the SVG files with headless Chromium rather than re-drawing
through Pillow. The old Pillow path composited a photographic foil and silently drifted
from the SVGs the moment the foil became a repeating gradient. One source, one look.

## Re-sync risks

- **`src/logo-paths.ts` is generated by `tools/build_logo.py`** (repo root, needs Python +
  shapely + Pillow). If the mark geometry in `brand/tokens.json` or `tools/silver_logo.py`
  changes, regenerate it or the library ships the old logo while the SVGs ship the new one.
  Nothing in `bun run build` regenerates it.
- **Fonts are self-hosted woff2 in `brand/fonts/`** (Inter variable + JetBrains Mono, latin and
  latin-ext subsets). Polish diacritics need latin-ext — verify any font swap still covers
  `ą ć ę ł ń ó ś ź ż`.
- **playwright pin**: the render check needs the playwright release matching the cached chromium
  build. This machine has `chromium-1223`, which is **playwright 1.60.0**. A different cache
  needs a different pin or the check fails with `Executable doesn't exist`.
- The demo page (`demo/index.html`) must be bundled as **IIFE**, not ESM — `type="module"`
  scripts are blocked on `file://` and the page renders blank with no console error.
- Only `general/` grouping is used: there are no per-component docs, so `[DOCS_UNMAPPED]` fires
  for all 18 and `.prompt.md` is synthesised from the `.d.ts` plus JSDoc. To group components in
  the DS pane, add stub `.md` files with `category:` frontmatter and point `cfg.docsDir` at them.
- **Lockups use a plain S, the standalone wordmark uses the logo-S.** Two code paths in
  `tools/silver_wordmark.py` (`glyph_S` and `glyph_S_plain`, selected by `wordmark(plain_s=)`).
  If a future change makes lockups use the stubbed S, the mark appears twice in one lockup.
- Prop JSDoc is **truncated at ~120 characters** in the emitted `.d.ts`. Keep the first line of
  every prop comment short and complete; put longer reasoning in the component-level JSDoc, which
  lands in `.prompt.md` untruncated.
