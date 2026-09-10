Button from @silver/ui. Use via `window.SilverUI.Button` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

```tsx
<Button variant="primary" href="/dolacz">Dołącz do nas</Button>
```

## Props

```ts
interface ButtonProps {
  /** `primary` is a foil fill, one per screen. `secondary` is outlined. `ghost` is bare text. */
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  /** Renders as an anchor. Pass `href` alongside. */
  href?: string;
  /** Stretches to the container's width. */
  block?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  id?: string;
}
```

## Examples

### Variants

```jsx
() => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
    <Button variant="primary">Dołącz do nas</Button>
    <Button variant="secondary">Zobacz projekty</Button>
    <Button variant="ghost">Regulamin</Button>
  </div>
)
```

### Sizes

```jsx
() => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
    <Button variant="primary" size="lg">
      Duży
    </Button>
    <Button variant="primary" size="md">
      Średni
    </Button>
    <Button variant="primary" size="sm">
      Mały
    </Button>
  </div>
)
```

### AsLink

```jsx
() => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
    <Button variant="primary" href="https://example.org/dolacz">
      Wypełnij formularz
    </Button>
    <Button variant="secondary" href="https://example.org/discord">
      Discord
    </Button>
  </div>
)
```

### Block

```jsx
() => (
  <div style={{ maxWidth: 320, display: 'grid', gap: 12 }}>
    <Button variant="primary" block>
      Zapisz się na warsztat
    </Button>
    <Button variant="secondary" block>
      Może później
    </Button>
  </div>
)
```

### Disabled

```jsx
() => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
    <Button variant="primary" disabled>
      Zapisy zamknięte
    </Button>
    <Button variant="secondary" disabled>
      Brak miejsc
    </Button>
  </div>
)
```
