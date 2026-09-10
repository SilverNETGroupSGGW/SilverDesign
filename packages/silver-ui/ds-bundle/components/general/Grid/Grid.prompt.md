Grid from @silver/ui. Use via `window.SilverUI.Grid` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface GridProps {
  /** Minimum column width before the grid wraps. */
  min?: number;
  gap?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
```

## Examples

### Default

```jsx
() => (
  <Grid min={220} gap="md">
    {[1, 2, 3, 4].map((n) => (
      <Cell key={n} n={n} />
    ))}
  </Grid>
)
```

### NarrowColumns

```jsx
() => (
  <Grid min={140} gap="sm">
    {[1, 2, 3, 4, 5, 6].map((n) => (
      <Cell key={n} n={n} />
    ))}
  </Grid>
)
```

### WideGap

```jsx
() => (
  <Grid min={240} gap="lg">
    {[1, 2].map((n) => (
      <Cell key={n} n={n} />
    ))}
  </Grid>
)
```
