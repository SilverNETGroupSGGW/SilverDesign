EventCard from @silver/ui. Use via `window.SilverUI.EventCard` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface EventCardProps {
  /** Short date, e.g. "12 LIS" or "12 NOV". Set in mono at the top. */
  date: React.ReactNode;
  /** Time and room, e.g. "18:00 · bud. 34 / 1.40". */
  meta?: React.ReactNode;
  title: React.ReactNode;
  /** One or two lines on what the meeting covers. */
  description?: React.ReactNode;
  /** Tech or topic chips along the bottom. */
  tags?: string[];
  href?: string;
  className?: string;
}
```

## Examples

### Single

```jsx
() => (
  <div style={{ maxWidth: 380 }}>
    <EventCard
      date="12 LIS"
      meta="18:00 · bud. 34 / 1.40"
      title="Wprowadzenie do Rusta"
      description="Od zera do pierwszego działającego CLI w dwie godziny. Przynieś laptopa."
      tags={['Rust', 'Warsztat']}
    />
  </div>
)
```

### Listing

```jsx
() => (
  <Grid min={260} gap="md">
    <EventCard
      date="12 LIS"
      meta="18:00 · bud. 34 / 1.40"
      title="Wprowadzenie do Rusta"
      description="Od zera do pierwszego działającego CLI w dwie godziny."
      tags={['Rust', 'Warsztat']}
    />
    <EventCard
      date="19 LIS"
      meta="18:00 · bud. 34 / 1.40"
      title="Code review w praktyce"
      description="Jak czytać cudzy kod i nie zepsuć relacji w zespole."
      tags={['Proces', 'Git']}
    />
    <EventCard
      date="26 LIS"
      meta="18:00 · online"
      title="Deploy na własnym k8s"
      description="Stawiamy klaster i wdrażamy projekt koła od zera."
      tags={['DevOps', 'Kubernetes']}
    />
  </Grid>
)
```

### Linked

```jsx
() => (
  <div style={{ maxWidth: 380 }}>
    <EventCard
      href="https://example.org/wydarzenia/hackathon"
      date="03 GRU"
      meta="10:00 · bud. 34, aula"
      title="Hackathon SGGW 2026"
      description="24 godziny, pięcioosobowe zespoły, trzy kategorie. Zapisy do 28 listopada."
      tags={['Hackathon', 'Zapisy']}
    />
  </div>
)
```

### Minimal

```jsx
() => (
  <div style={{ maxWidth: 380 }}>
    <EventCard date="Środy" title="Cotygodniowe spotkanie koła" />
  </div>
)
```
