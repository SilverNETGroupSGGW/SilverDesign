Stat from @silver/ui. Use via `window.SilverUI.Stat` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface StatProps {
  /** The number itself. Rendered in foil at display scale. */
  value: React.ReactNode;
  label: React.ReactNode;
  className?: string;
}
```

## Examples

### Row

```jsx
() => (
  <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
    <Stat value="120+" label="Członków" />
    <Stat value="14" label="Projektów" />
    <Stat value="2016" label="Działamy od" />
  </div>
)
```

### Single

```jsx
() => <Stat value="24h" label="Hackathon SGGW" />
```
