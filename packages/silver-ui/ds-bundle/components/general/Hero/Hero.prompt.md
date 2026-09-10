Hero from @silver/ui. Use via `window.SilverUI.Hero` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

The page opener: bled ribbon behind, wordmark and headline in front. This
is the composition the posters use, so a landing page and a printed sheet
read as the same thing.

```tsx
<Hero
  eyebrow="Koło naukowe · SGGW"
  title={<><Foil>Budujemy oprogramowanie.</Foil> Od zera.</>}
  lede="Spotykamy się co tydzień i budujemy własne projekty."
  actions={<Button variant="primary">Dołącz</Button>}
/>
```

## Props

```ts
interface HeroProps {
  eyebrow?: React.ReactNode;
  /** The headline. Wrap part of it in `<Foil>` to make it metallic. */
  title: React.ReactNode;
  lede?: React.ReactNode;
  /** Buttons, usually. */
  actions?: React.ReactNode;
  /** Shows the wordmark above the eyebrow. Turn off when a header already carries the logo. */
  wordmark?: boolean;
  /** Turns off the bled ribbon, for a text-only hero. */
  ribbon?: boolean;
  className?: string;
  children?: React.ReactNode;
}
```

## Examples

### Landing

```jsx
() => (
  <Hero
    eyebrow="Koło naukowe · SGGW w Warszawie"
    title={<Foil ramp="bright">Budujemy oprogramowanie.</Foil>}
    lede="Silver to koło naukowe inżynierii oprogramowania. Spotykamy się co tydzień, prowadzimy własne projekty i uczymy się na nich nawzajem."
    actions={
      <>
        <Button variant="primary">Dołącz do nas</Button>
        <Button variant="secondary">Zobacz projekty</Button>
      </>
    }
  />
)
```

### NoRibbon

```jsx
() => (
  <Hero
    ribbon={false}
    eyebrow="Rekrutacja"
    title="Nabór otwarty do 30 listopada"
    lede="Bez rozmowy kwalifikacyjnej. Przyjdź na spotkanie i zobacz, czy to dla ciebie."
    actions={<Button variant="primary">Wypełnij formularz</Button>}
  />
)
```

### NoWordmark

```jsx
() => (
  <Hero
    wordmark={false}
    eyebrow="Wydarzenie"
    title="Hackathon SGGW 2026"
    lede="24 godziny, pięcioosobowe zespoły, trzy kategorie."
  />
)
```
