Eyebrow from @silver/ui. Use via `window.SilverUI.Eyebrow` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface EyebrowProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
```

## Examples

### Default

```jsx
() => (
  <div style={{ display: 'grid', gap: 4 }}>
    <Eyebrow>Koło naukowe · SGGW w Warszawie</Eyebrow>
    <Eyebrow>Sekcja · 01</Eyebrow>
    <Eyebrow>Nabór otwarty</Eyebrow>
  </div>
)
```

### AboveHeading

```jsx
() => (
  <div style={{ maxWidth: 560 }}>
    <Eyebrow>Projekty</Eyebrow>
    <Heading level={2} size="lg">
      Co budujemy w tym semestrze
    </Heading>
    <Text style={{ marginTop: 12 }}>
      Eyebrow jest jedynym miejscem, gdzie system używa szeroko rozstrzelonych wersalików — stąd
      jego techniczny charakter.
    </Text>
  </div>
)
```
