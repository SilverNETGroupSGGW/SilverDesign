Tag from @silver/ui. Use via `window.SilverUI.Tag` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface TagProps {
  /** `solid` is a foil chip with dark text; `outline` is a hairline chip. */
  tone?: "outline" | "solid";
  className?: string;
  children?: React.ReactNode;
}
```

## Examples

### Tones

```jsx
() => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
    <Tag>TypeScript</Tag>
    <Tag>Rust</Tag>
    <Tag>Postgres</Tag>
    <Tag tone="solid">Nabór otwarty</Tag>
  </div>
)
```

### Stack

```jsx
() => (
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 320 }}>
    <Tag>React</Tag>
    <Tag>Vite</Tag>
    <Tag>Kubernetes</Tag>
    <Tag>Python</Tag>
    <Tag>Pandas</Tag>
    <Tag>Figma</Tag>
  </div>
)
```
