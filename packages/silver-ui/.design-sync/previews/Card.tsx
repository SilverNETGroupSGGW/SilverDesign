import { Card, Eyebrow, Grid, Heading, Tag, Text } from '@silver/ui';

export const Default = () => (
  <div style={{ maxWidth: 340 }}>
    <Card>
      <Eyebrow>Projekt</Eyebrow>
      <Heading level={3}>Orbit</Heading>
      <Text size="sm" style={{ marginTop: 8 }}>
        Planer zajęć dla studentów SGGW. React, Postgres, wdrożenie na własnym klastrze.
      </Text>
    </Card>
  </div>
);

export const Tones = () => (
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
);

export const CutSizes = () => (
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
);

export const Linked = () => (
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
);
