Section from @silver/ui. Use via `window.SilverUI.Section` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface SectionProps {
  /** Small mono kicker above the heading. */
  eyebrow?: React.ReactNode;
  /** Rendered as an `h2`. */
  title?: React.ReactNode;
  /** One paragraph under the heading. */
  lede?: React.ReactNode;
  /** Vertical rhythm. `lg` is a full page section, `sm` is a sub-block. */
  space?: "sm" | "md" | "lg";
  /** Draws a hairline across the top. */
  divider?: boolean;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
```

## Examples

### WithHeader

```jsx
() => (
  <Section
    eyebrow="Projekty"
    title="Co budujemy w tym semestrze"
    lede="Każdy projekt prowadzi jedna osoba z koła. Dołączyć można na dowolnym etapie — również do trwającego projektu."
  >
    <Grid min={220} gap="md">
      <Card>
        <Eyebrow>Orbit</Eyebrow>
        <Text size="sm" style={{ marginTop: 8 }}>
          Planer zajęć dla studentów.
        </Text>
      </Card>
      <Card>
        <Eyebrow>Silverbot</Eyebrow>
        <Text size="sm" style={{ marginTop: 8 }}>
          Bot Discorda do zapisów.
        </Text>
      </Card>
    </Grid>
  </Section>
)
```

### Divided

```jsx
() => (
  <div>
    <Section space="sm" title="Pierwsza sekcja">
      <Text size="sm">Treść pierwszej sekcji.</Text>
    </Section>
    <Section space="sm" divider title="Druga sekcja">
      <Text size="sm">Kreska u góry oddziela ją od poprzedniej.</Text>
    </Section>
  </div>
)
```

### Spacing

```jsx
() => (
  <div>
    <Section space="sm" divider>
      <Heading level={3} size="sm">
        space sm
      </Heading>
    </Section>
    <Section space="md" divider>
      <Heading level={3} size="sm">
        space md
      </Heading>
    </Section>
  </div>
)
```
