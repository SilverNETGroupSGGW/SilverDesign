Foil from @silver/ui. Use via `window.SilverUI.Foil` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

Silver's one emphasis device. The system has no accent colour — brightness
is the accent — so this is what "highlighted" means here.

```tsx
<Heading level={1}><Foil>Budujemy oprogramowanie.</Foil></Heading>
```

## Props

```ts
interface FoilProps {
  /** `text` paints the ramp through glyphs; `surface` fills the box and flips text to dark. */
  as?: "text" | "surface";
  /** `bright` lifts the ramp's dark end. Use below ~24px, where the shadow end closes up. */
  ramp?: "default" | "bright";
  /** Element to render. Defaults to `span` for text, `div` for surface. */
  element?: "symbol" | "object" | "style" | "form" | "slot" | "title" | "text" | "a" | "abbr" | "address" | "area" | "article" | "aside" | "audio" | "b" | "base" | (string & {}) /* +162 more */;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
```

## Examples

### AsText

```jsx
() => (
  <div style={{ display: 'grid', gap: 16 }}>
    <Heading level={2} size="xl">
      <Foil>Budujemy oprogramowanie</Foil>
    </Heading>
    <Text>
      Zwykły tekst dla porównania — <Foil>foil</Foil> działa też w linii.
    </Text>
  </div>
)
```

### Ramps

```jsx
() => (
  <div style={{ display: 'grid', gap: 18, maxWidth: 460 }}>
    <div>
      <div
        style={{
          font: '500 11px/1 var(--font-mono)',
          letterSpacing: '0.22em',
          color: 'var(--dim)',
          marginBottom: 8,
        }}
      >
        ramp default
      </div>
      <Text size="sm" style={{ margin: 0 }}>
        <Foil>Przy tym rozmiarze ciemny koniec rampy zlewa się z tłem.</Foil>
      </Text>
    </div>
    <div>
      <div
        style={{
          font: '500 11px/1 var(--font-mono)',
          letterSpacing: '0.22em',
          color: 'var(--dim)',
          marginBottom: 8,
        }}
      >
        ramp bright
      </div>
      <Text size="sm" style={{ margin: 0 }}>
        <Foil ramp="bright">Przy tym rozmiarze ciemny koniec rampy zlewa się z tłem.</Foil>
      </Text>
    </div>
    <Text size="sm" tone="dim" style={{ margin: 0 }}>
      Dlatego poniżej ~24px zawsze bright. Na dużym tekście różnica jest niewidoczna — obie rampy
      trafiają w ten sam jasny fragment arkusza.
    </Text>
  </div>
)
```

### AsSurface

```jsx
() => (
  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
    <Foil as="surface" style={{ padding: '20px 28px' }}>
      Panel wypełniony folią
    </Foil>
    <Foil as="surface" ramp="bright" style={{ padding: '20px 28px' }}>
      Wariant bright
    </Foil>
  </div>
)
```
