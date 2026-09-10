Mono from @silver/ui. Use via `window.SilverUI.Mono` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface MonoProps {
  tone?: "ink" | "muted" | "dim";
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
```

## Examples

### Inline

```jsx
() => (
  <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
    <Text>
      Spotykamy się w środy o <Mono>18:00</Mono> w sali <Mono>34 / 1.40</Mono>.
    </Text>
    <Text>
      Sklonuj repo: <Mono>git clone git@github.com:silver-sggw/orbit.git</Mono>
    </Text>
  </div>
)
```

### Tones

```jsx
() => (
  <div style={{ display: 'grid', gap: 8 }}>
    <Mono tone="ink">ink — dane, które trzeba przeczytać</Mono>
    <Mono tone="muted">muted — kontekst</Mono>
    <Mono tone="dim">dim — wersje, znaczniki czasu</Mono>
  </div>
)
```
