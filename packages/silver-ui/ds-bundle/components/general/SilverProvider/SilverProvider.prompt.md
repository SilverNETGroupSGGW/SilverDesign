SilverProvider from @silver/ui. Use via `window.SilverUI.SilverProvider` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

Root wrapper for anything built with Silver. Every other component reads
its colours, type and spacing from CSS custom properties that live on this
element — without it components render with no tokens and fall back to
browser defaults.

It also owns the foil sheet. Foil is one continuous surface behind the
page rather than a fill repeated per element, and `drift` animates that
one sheet here — never on the elements sampling it.

Wrap the whole app once, at the top:

```tsx
<SilverProvider surface="void">
  <Section>…</Section>
</SilverProvider>
```

## Props

```ts
interface SilverProviderProps {
  /** Page ground. `void` is the default; `graphite` matches the mark's own background. */
  surface?: "void" | "graphite";
  /** Brushed-metal grain over the surface. On by default; stops dark areas reading flat. */
  grain?: boolean;
  /** Travels the shared foil sheet. On by default; disabled under `prefers-reduced-motion`. */
  drift?: boolean;
  /** Renders as this element instead of a div. */
  as?: "body" | "div" | "main" | "section";
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
```

## Examples

### Surfaces

```jsx
() => (
  <div style={{ display: 'grid', gap: 16 }}>
    <SilverProvider surface="void" style={{ padding: 24 }}>
      <Eyebrow>surface void</Eyebrow>
      <Text size="sm" style={{ marginTop: 6 }}>
        Domyślne tło strony.
      </Text>
    </SilverProvider>
    <SilverProvider surface="graphite" style={{ padding: 24 }}>
      <Eyebrow>surface graphite</Eyebrow>
      <Text size="sm" style={{ marginTop: 6 }}>
        Tło samego znaku — pasuje pod sekcję gęstą od kart.
      </Text>
    </SilverProvider>
  </div>
)
```

### Grain

```jsx
() => (
  <div style={{ display: 'grid', gap: 16 }}>
    <SilverProvider surface="graphite" grain style={{ padding: 24 }}>
      <Eyebrow>grain on</Eyebrow>
    </SilverProvider>
    <SilverProvider surface="graphite" grain={false} style={{ padding: 24 }}>
      <Eyebrow>grain off</Eyebrow>
    </SilverProvider>
  </div>
)
```

### WrappingAnApp

```jsx
() => (
  <SilverProvider surface="void" style={{ padding: 28 }}>
    <Eyebrow>Koło naukowe · SGGW</Eyebrow>
    <Heading level={2} size="lg">
      Wszystko żyje wewnątrz providera
    </Heading>
    <Card style={{ marginTop: 20, maxWidth: 320 }}>
      <Text size="sm">
        Bez niego komponenty nie mają tokenów i renderują się domyślnymi stylami przeglądarki.
      </Text>
    </Card>
  </SilverProvider>
)
```
