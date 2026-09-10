PersonCard from @silver/ui. Use via `window.SilverUI.PersonCard` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<SilverProvider>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface PersonCardProps {
  name: React.ReactNode;
  /** Role in the club, e.g. "Przewodniczący" or "Lead, Orbit". */
  role?: React.ReactNode;
  /** Photo URL. Without one the initials are shown on a foil tile. */
  photo?: string;
  /** Falls back to the first letters of `name` when no photo is given. */
  initials?: string;
  className?: string;
}
```

## Examples

### Board

```jsx
() => (
  <Grid min={230} gap="md">
    <PersonCard name="Anna Kowalska" role="Przewodnicząca" />
    <PersonCard name="Michał Nowak" role="Lead, Orbit" />
    <PersonCard name="Zofia Lis" role="Warsztaty" />
    <PersonCard name="Jakub Wiśniewski" role="Skarbnik" />
  </Grid>
)
```

### Initials

```jsx
() => (
  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
    <PersonCard name="Anna Kowalska" role="Przewodnicząca" />
    <PersonCard name="Łukasz Żółć" initials="ŁŻ" role="DevOps" />
    <PersonCard name="Ewa" role="Grafika" />
  </div>
)
```

### NoRole

```jsx
() => <PersonCard name="Piotr Zając" />
```
