RibbonBackdrop from @silver/ui. Use via `window.SilverUI.RibbonBackdrop` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface RibbonBackdropProps {
  /** Corner the ribbon's tile is anchored to. */
  position?: "center" | "top-right" | "top-left";
  /** Tile size as a multiple of container width. Below ~1.4 the bands get cut mid-air. */
  scale?: number;
  /** 0–1. Keep it low: at 27 degrees the band always crosses a hero's text column. */
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}
```

## Examples

### TopRight

```jsx
() => (
  <Frame>
    <RibbonBackdrop position="top-right" opacity={0.5} />
    <div style={{ position: 'relative', zIndex: 2 }}>
      <Eyebrow>position top-right</Eyebrow>
      <Heading level={3} size="md">
        Tekst zostaje czytelny
      </Heading>
    </div>
  </Frame>
)
```

### TopLeft

```jsx
() => (
  <Frame>
    <RibbonBackdrop position="top-left" opacity={0.5} />
    <div style={{ position: 'relative', zIndex: 2 }}>
      <Eyebrow>position top-left</Eyebrow>
    </div>
  </Frame>
)
```

### Centered

```jsx
() => (
  <Frame>
    <RibbonBackdrop position="center" scale={1.2} opacity={0.7} />
    <div style={{ position: 'relative', zIndex: 2 }}>
      <Eyebrow>position center</Eyebrow>
    </div>
  </Frame>
)
```

### Opacities

```jsx
() => (
  <div style={{ display: 'grid', gap: 12 }}>
    <Frame>
      <RibbonBackdrop opacity={1} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Eyebrow>opacity 1 — tylko bez tekstu</Eyebrow>
      </div>
    </Frame>
    <Frame>
      <RibbonBackdrop opacity={0.3} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Eyebrow>opacity 0.3 — pod tekstem</Eyebrow>
      </div>
    </Frame>
  </div>
)
```
