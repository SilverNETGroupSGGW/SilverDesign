import { Card, Eyebrow, Heading, SilverProvider, Text } from '@silver/ui';

export const Surfaces = () => (
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
);

export const Grain = () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <SilverProvider surface="graphite" grain style={{ padding: 24 }}>
      <Eyebrow>grain on</Eyebrow>
    </SilverProvider>
    <SilverProvider surface="graphite" grain={false} style={{ padding: 24 }}>
      <Eyebrow>grain off</Eyebrow>
    </SilverProvider>
  </div>
);

export const WrappingAnApp = () => (
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
);
