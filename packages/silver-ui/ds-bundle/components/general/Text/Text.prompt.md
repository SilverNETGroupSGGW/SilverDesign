Text from @silver/ui. Use via `window.SilverUI.Text` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface TextProps {
  /** `muted` for body, `dim` for metadata, `ink` for text sitting next to a heading. */
  tone?: "ink" | "muted" | "dim";
  size?: "sm" | "md" | "lg";
  /** Caps the measure so lines stay readable. Defaults to on. */
  measure?: boolean;
  element?: "div" | "li" | "p" | "span";
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
```

## Examples

### Sizes

```jsx
() => (
  <div style={{ display: 'grid', gap: 16, maxWidth: 600 }}>
    <Text size="lg">
      Duży tekst prowadzący — używany pod nagłówkiem sekcji, żeby wprowadzić temat.
    </Text>
    <Text size="md">
      Tekst podstawowy. Prowadzimy własne projekty od pierwszego commita do wdrożenia i raz w
      semestrze pokazujemy efekty na wydziale.
    </Text>
    <Text size="sm">Mały tekst — opisy w kartach i podpisy pod elementami.</Text>
  </div>
)
```

### Tones

```jsx
() => (
  <div style={{ display: 'grid', gap: 12, maxWidth: 600 }}>
    <Text tone="ink">Ink — tekst, który musi się obronić obok nagłówka.</Text>
    <Text tone="muted">Muted — domyślny kolor tekstu podstawowego.</Text>
    <Text tone="dim">Dim — metadane, przypisy, informacje drugorzędne.</Text>
  </div>
)
```

### Measure

```jsx
() => (
  <div style={{ display: 'grid', gap: 20 }}>
    <Text>
      Z domyślnym ograniczeniem szerokości wiersz nie rozciąga się w nieskończoność, więc oko wraca
      do właściwej linijki. To jest zachowanie domyślne i prawie zawsze właściwe.
    </Text>
    <Text measure={false}>
      Bez ograniczenia tekst wypełnia całą dostępną szerokość kontenera, co przy szerokim układzie
      robi się męczące w czytaniu, ale bywa potrzebne w wąskich kolumnach.
    </Text>
  </div>
)
```
