import { Heading, Rule, Text } from '@silver/ui';

export const Angle = () => (
  <div style={{ maxWidth: 520 }}>
    <Heading level={3} size="md">
      Kreska pod kątem marki
    </Heading>
    <Rule />
    <Text size="sm">
      Domyślna kreska biegnie pod kątem 27,07° — tym samym, co pasma w znaku. Jest krótka z
      konieczności: pod tym kątem linia przez całą kolumnę byłaby wyższa niż sekcja.
    </Text>
  </div>
);

export const Lengths = () => (
  <div style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
    <Rule length={60} />
    <Rule length={120} />
    <Rule length={200} />
  </div>
);

export const Flat = () => (
  <div style={{ maxWidth: 520 }}>
    <Text size="sm">Nad kreską.</Text>
    <div style={{ margin: '16px 0' }}>
      <Rule variant="flat" />
    </div>
    <Text size="sm">Pod kreską — wariant flat rozciąga się na całą szerokość.</Text>
  </div>
);
