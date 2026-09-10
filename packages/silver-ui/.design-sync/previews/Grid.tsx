import { Card, Eyebrow, Grid, Text } from '@silver/ui';

const Cell = ({ n }: { n: number }) => (
  <Card>
    <Eyebrow>Karta {n}</Eyebrow>
    <Text size="sm" style={{ marginTop: 8 }}>
      Kolumny wynikają z min, nigdy nie są deklarowane wprost.
    </Text>
  </Card>
);

export const Default = () => (
  <Grid min={220} gap="md">
    {[1, 2, 3, 4].map((n) => (
      <Cell key={n} n={n} />
    ))}
  </Grid>
);

export const NarrowColumns = () => (
  <Grid min={140} gap="sm">
    {[1, 2, 3, 4, 5, 6].map((n) => (
      <Cell key={n} n={n} />
    ))}
  </Grid>
);

export const WideGap = () => (
  <Grid min={240} gap="lg">
    {[1, 2].map((n) => (
      <Cell key={n} n={n} />
    ))}
  </Grid>
);
