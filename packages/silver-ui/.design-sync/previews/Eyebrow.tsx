import { Eyebrow, Heading, Text } from '@silver/ui';

export const Default = () => (
  <div style={{ display: 'grid', gap: 4 }}>
    <Eyebrow>Koło naukowe · SGGW w Warszawie</Eyebrow>
    <Eyebrow>Sekcja · 01</Eyebrow>
    <Eyebrow>Nabór otwarty</Eyebrow>
  </div>
);

export const AboveHeading = () => (
  <div style={{ maxWidth: 560 }}>
    <Eyebrow>Projekty</Eyebrow>
    <Heading level={2} size="lg">
      Co budujemy w tym semestrze
    </Heading>
    <Text style={{ marginTop: 12 }}>
      Eyebrow jest jedynym miejscem, gdzie system używa szeroko rozstrzelonych wersalików — stąd
      jego techniczny charakter.
    </Text>
  </div>
);
