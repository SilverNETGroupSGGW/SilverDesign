Logo from @silver/ui. Use via `window.SilverUI.Logo` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

The Silver logo, drawn inline. Nothing is fetched, so it renders correctly
wherever it lands.

## Props

```ts
interface LogoProps {
  /** `mark` is the bleeding tile, `icon` is it cropped to the S, `wordmark` is SILVER alone. */
  variant?: "mark" | "icon" | "wordmark" | "lockup-horizontal" | "lockup-stacked";
  /** Rendered width in px. Height follows the variant's aspect ratio. */
  width?: number;
  /** `foil` is the metallic gradient; `mono` inherits `currentColor` for one-colour output. */
  tone?: "foil" | "mono";
  /** Paints the mark's own Graphite square behind it. Ignored by `wordmark`. */
  background?: boolean;
  /** Accessible name. Pass `''` for a purely decorative logo. */
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}
```

## Examples

### Mark

```jsx
() => (
  <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
    <Logo variant="mark" width={180} background />
    <Logo variant="mark" width={110} background />
  </div>
)
```

### Lockups

```jsx
() => (
  <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
    <Logo variant="lockup-horizontal" width={260} />
    <Logo variant="lockup-stacked" width={150} />
  </div>
)
```

### Wordmark

```jsx
() => (
  <div style={{ display: 'grid', gap: 24, justifyItems: 'start' }}>
    <Logo variant="wordmark" width={280} />
    <Logo variant="wordmark" width={160} />
  </div>
)
```

### Icon

```jsx
() => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
    <Logo variant="icon" width={64} background />
    <Logo variant="icon" width={40} background />
    <Logo variant="icon" width={28} background />
    <Logo variant="icon" width={16} background />
  </div>
)
```

### Mono

```jsx
() => (
  <div style={{ display: 'flex', gap: 32, alignItems: 'center', color: 'var(--ink)' }}>
    <Logo variant="mark" width={120} tone="mono" />
    <Logo variant="wordmark" width={180} tone="mono" />
  </div>
)
```
