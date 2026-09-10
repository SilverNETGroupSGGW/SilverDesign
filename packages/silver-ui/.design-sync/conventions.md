# Building with Silver

Silver is the design system of Silver, a software-engineering student club at SGGW in Warsaw.
It is dark-first, achromatic, and built around one geometric constant.

## Wrap everything in `SilverProvider`

Every component reads its colour, type and spacing from CSS custom properties that
`SilverProvider` puts on the DOM. **Without it components render with browser defaults — black
text on white, no fonts, no spacing.** Wrap the app once, at the root:

```tsx
import { SilverProvider, Section, Heading, Text } from '@silver/ui';
import '@silver/ui/styles.css';

<SilverProvider surface="void">
  <Section eyebrow="Projekty" title="Co budujemy">
    <Text>Treść sekcji.</Text>
  </Section>
</SilverProvider>;
```

`surface="void"` (`#0E0F12`) is the page ground; `surface="graphite"` (`#15171B`) is a slightly
lifted ground for card-heavy screens. Nesting a second provider to change surface mid-page is
supported and normal.

## Two rules that define the look

1. **There is no accent colour.** Emphasis is _brightness_, never hue. To emphasise something,
   wrap it in `<Foil>` — the metallic gradient — or raise its scale. Never introduce a blue, a
   green, or a brand colour: an accent hue is off-brand here by definition. Error and warning
   states use weight and white, not red.
2. **Every diagonal is 27.07°.** That is the angle of the bands in the logo, exported as
   `BRAND_ANGLE` and available in CSS as `var(--angle)` (with `var(--angle-tan)` = `0.51087` for
   geometry and `var(--angle-css)` = `62.93deg` for gradients). `Rule`'s tick, `RibbonBackdrop`,
   the foil gradient and the ghost-button underline all use it. If you add a diagonal, use this
   angle; if you cannot, use a horizontal.
3. **Everything is rounded.** The mark is a ribbon — there is not a straight corner in it — so
   the system follows: `--radius-sm` 8px, `--radius` 14px, `--radius-lg` 22px, `--radius-xl`
   34px, `--radius-pill`. `Card` sweeps its bottom-left corner much wider than the other three;
   that asymmetry is the card silhouette, not a mistake.

## Styling idiom: tokens, not classes

There is **no utility-class vocabulary**. The `sv-*` classes in the stylesheet are internal
implementation and must never be written in app code. Style the components through their props,
and style your own layout glue with inline styles or CSS that reads these custom properties:

| Family   | Tokens                                                                                                         |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| Surfaces | `--void`, `--graphite`, `--slate`, `--hairline`                                                                |
| Text     | `--ink`, `--muted`, `--dim`, `--on-foil`                                                                       |
| Foil     | `--foil`, `--foil-bright`, `--silver`, `--silver-lit`, `--silver-dark`                                         |
| Type     | `--font-sans` (Inter), `--font-mono` (JetBrains Mono), `--track-display`, `--track-body`, `--track-label`      |
| Angle    | `--angle`, `--angle-css`, `--angle-tan`                                                                        |
| Space    | `--s-1` 4px, `--s-2` 8px, `--s-3` 16px, `--s-4` 24px, `--s-5` 40px, `--s-6` 64px, `--s-7` 104px, `--s-8` 168px |
| Shape    | `--radius-sm`, `--radius`, `--radius-lg`, `--radius-xl`, `--radius-pill`                                       |
| Texture  | `--grain`, `--grain-sheet`, `--grain-on-foil`, `--grain-on-ground`, `--foil-sheet`, `--foil-drift`             |

Reach for a component before reaching for a token: `Section` already handles vertical rhythm,
`Grid` already handles wrapping columns, `Rule` already handles the angle.

## Foil is one sheet, not a fill

Every foil element paints the same gradient with `background-attachment: fixed`, so it is
positioned against the viewport rather than the element's own box. All of them are windows onto
a single continuous sheet of metal: two buttons at different places on the page catch different
parts of the ramp, exactly as two cut pieces of one sheet would. Do not "fix" an element that
looks darker than its neighbour — that is the system working.

Consequences when you build:

- Do not set `background-attachment`, `background-size` or `background-position` on anything
  wearing foil. Overriding any one of the three drops that element off the shared sheet and it
  stops matching everything around it.
- The brushed grain is part of the same sheet, so it varies and travels with the gradient. It
  needs a different blend per ground: `overlay` at `--grain-on-foil` on bright foil, `soft-light`
  at `--grain-on-ground` on the near-black page. Using `overlay` on a dark ground paints nothing.
- The sheet **travels by default** — `SilverProvider` has `drift` on. It animates one custom
  property on the root, never a property per element, and stops under `prefers-reduced-motion`.
  Pass `drift={false}` for a still surface.

## The components

`SilverProvider` · `Hero` · `Section` · `Grid` · `Card` · `EventCard` · `PersonCard` ·
`Button` · `Logo` · `Foil` · `Heading` · `Text` · `Eyebrow` · `Mono` · `Tag` · `Stat` ·
`Rule` · `RibbonBackdrop`

Two that are easy to misuse:

- **`Logo`** — `variant="mark"` is the full bleeding tile for hero use; `variant="icon"` is that
  tile cropped to the S and is what you use below ~48px, because the full tile turns into a grey
  dash. `lockup-horizontal` is the default when the logo needs the name beside it. The `wordmark`
  needs no separate mark beside it: its S _is_ the mark, knot and band stubs included.
- **`RibbonBackdrop`** — decorative, absolutely positioned, so its parent needs
  `position: relative`. Keep `opacity` around `0.4` when text sits on top: at 27° the band always
  crosses a wide container's text column. `Hero` already composes it correctly.

Copy in this system is usually Polish (the club is at SGGW). Use realistic Polish content rather
than lorem ipsum, and check that diacritics render — the shipped fonts carry latin-ext.

## Where the truth is

- `_ds/<folder>/styles.css` and the files it `@import`s — the real tokens and component CSS.
- `components/<group>/<Name>/<Name>.prompt.md` — per-component usage.
- `components/<group>/<Name>/<Name>.d.ts` — the exact prop contract.

Read those before styling; they are authoritative over anything summarised here.
