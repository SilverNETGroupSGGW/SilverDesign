Card from @silver/ui. Use via `window.SilverUI.Card` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

The container everything else sits in — Discord announcements, project
tiles, event listings.

```tsx
<Card interactive href="/projekty/orbit">
  <Eyebrow>Projekt</Eyebrow>
  <Heading level={3}>Orbit</Heading>
</Card>
```

## Props

```ts
interface CardProps {
  /** Cuts the bottom-left corner on the brand angle. The system's card shape; leave it on. */
  cut?: boolean;
  /** Size of the corner cut, in px of horizontal run. */
  cutSize?: number;
  /** `slate` is the standard raised panel. `outline` is a hairline box with no fill, for lists of many cards. */
  tone?: "slate" | "outline";
  /** Lifts the border and background on hover. Use for cards that link. */
  interactive?: boolean;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
```

## Examples

### Default

```jsx
() => (
  <div style={{ maxWidth: 340 }}>
    <Card>
      <Eyebrow>Projekt</Eyebrow>
      <Heading level={3}>Orbit</Heading>
      <Text size="sm" style={{ marginTop: 8 }}>
        Planer zajęć dla studentów SGGW. React, Postgres, wdrożenie na własnym klastrze.
      </Text>
    </Card>
  </div>
)
```

### Tones

```jsx
() => (
  <Grid min={240} gap="md">
    <Card tone="slate">
      <Eyebrow>Slate</Eyebrow>
      <Text size="sm" style={{ marginTop: 8 }}>
        Standardowy panel — wypełnienie i obrys.
      </Text>
    </Card>
    <Card tone="outline">
      <Eyebrow>Outline</Eyebrow>
      <Text size="sm" style={{ marginTop: 8 }}>
        Sam obrys, do długich list kart.
      </Text>
    </Card>
  </Grid>
)
```

### CutSizes

```jsx
() => (
  <Grid min={190} gap="md">
    <Card cutSize={90}>
      <Eyebrow>cutSize 90</Eyebrow>
    </Card>
    <Card cutSize={56}>
      <Eyebrow>cutSize 56</Eyebrow>
    </Card>
    <Card cut={false}>
      <Eyebrow>bez ścięcia</Eyebrow>
    </Card>
  </Grid>
)
```

### Linked

```jsx
() => (
  <div style={{ maxWidth: 340 }}>
    <Card href="https://example.org/projekty/kalibra" interactive>
      <Eyebrow>Projekt · szuka ludzi</Eyebrow>
      <Heading level={3}>Kalibra</Heading>
      <Text size="sm" style={{ marginTop: 8 }}>
        Narzędzie do analizy danych pomiarowych z wydziału.
      </Text>
      <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
        <Tag>Python</Tag>
        <Tag>Pandas</Tag>
      </div>
    </Card>
  </div>
)
```
