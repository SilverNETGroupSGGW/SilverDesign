Rule from @silver/ui. Use via `window.SilverUI.Rule` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface RuleProps {
  /** `angle` is the 27 degree brand tick (default). `flat` is a plain full-width hairline. */
  variant?: "angle" | "flat";
  /** Length in px, for the angled variant. */
  length?: number;
  className?: string;
  style?: React.CSSProperties;
}
```

## Examples

### Angle

```jsx
() => (
  <div style={{ maxWidth: 520 }}>
    <Heading level={3} size="md">
      Kreska pod kątem marki
    </Heading>
    <Rule />
    <Text size="sm">
      Domyślna kreska biegnie pod kątem 27,07° — tym samym, co pasma w znaku. Jest krótka z
      konieczności: pod tym kątem linia przez całą kolumnę byłaby wyższa niż sekcja.
    </Text>
  </div>
)
```

### Lengths

```jsx
() => (
  <div style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
    <Rule length={60} />
    <Rule length={120} />
    <Rule length={200} />
  </div>
)
```

### Flat

```jsx
() => (
  <div style={{ maxWidth: 520 }}>
    <Text size="sm">Nad kreską.</Text>
    <div style={{ margin: '16px 0' }}>
      <Rule variant="flat" />
    </div>
    <Text size="sm">Pod kreską — wariant flat rozciąga się na całą szerokość.</Text>
  </div>
)
```
