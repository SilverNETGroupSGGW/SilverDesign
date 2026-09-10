Heading from @silver/ui. Use via `window.SilverUI.Heading` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface HeadingProps {
  /** Heading rank. Also picks the default size, which `size` can override. */
  level?: 1 | 2 | 3 | 4;
  /** `display` is poster-scale and only belongs at the top of a page. */
  size?: "sm" | "md" | "lg" | "display" | "xl";
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
```

## Examples

### Scale

```jsx
() => (
  <div style={{ display: 'grid', gap: 24 }}>
    <Heading level={1} size="display">
      Budujemy oprogramowanie
    </Heading>
    <Heading level={1} size="xl">
      Koło naukowe Silver
    </Heading>
    <Heading level={2} size="lg">
      Projekty studenckie
    </Heading>
    <Heading level={3} size="md">
      Spotkania w środy
    </Heading>
    <Heading level={4} size="sm">
      Zapisy na warsztat
    </Heading>
  </div>
)
```

### WithFoil

```jsx
() => (
  <div style={{ display: 'grid', gap: 20 }}>
    <Heading level={1} size="xl">
      <Foil ramp="bright">Silver</Foil> to koło naukowe
    </Heading>
    <Text>
      Owinięcie części nagłówka w <code>Foil</code> nadaje jej metaliczny gradient. To jedyny sposób
      wyróżniania w systemie — nie ma koloru akcentu.
    </Text>
  </div>
)
```

### InContext

```jsx
() => (
  <div style={{ display: 'grid', gap: 12, maxWidth: 620 }}>
    <Heading level={2} size="lg">
      Czym się zajmujemy
    </Heading>
    <Text>
      Prowadzimy własne projekty od pierwszego commita do wdrożenia. Uczymy się na cudzym kodzie,
      recenzujemy swoje pull requesty i raz w semestrze pokazujemy efekty na wydziale.
    </Text>
    <Text size="sm" tone="dim">
      Polskie znaki diakrytyczne: ą ć ę ł ń ó ś ź ż — Inter ships latin-ext.
    </Text>
  </div>
)
```
