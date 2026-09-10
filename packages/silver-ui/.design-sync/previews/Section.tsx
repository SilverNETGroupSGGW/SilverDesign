import { Card, Eyebrow, Grid, Heading, Section, Text } from '@silver/ui';

export const WithHeader = () => (
  <Section
    eyebrow="Projekty"
    title="Co budujemy w tym semestrze"
    lede="Każdy projekt prowadzi jedna osoba z koła. Dołączyć można na dowolnym etapie — również do trwającego projektu."
  >
    <Grid min={220} gap="md">
      <Card>
        <Eyebrow>Orbit</Eyebrow>
        <Text size="sm" style={{ marginTop: 8 }}>
          Planer zajęć dla studentów.
        </Text>
      </Card>
      <Card>
        <Eyebrow>Silverbot</Eyebrow>
        <Text size="sm" style={{ marginTop: 8 }}>
          Bot Discorda do zapisów.
        </Text>
      </Card>
    </Grid>
  </Section>
);

export const Divided = () => (
  <div>
    <Section space="sm" title="Pierwsza sekcja">
      <Text size="sm">Treść pierwszej sekcji.</Text>
    </Section>
    <Section space="sm" divider title="Druga sekcja">
      <Text size="sm">Kreska u góry oddziela ją od poprzedniej.</Text>
    </Section>
  </div>
);

export const Spacing = () => (
  <div>
    <Section space="sm" divider>
      <Heading level={3} size="sm">
        space sm
      </Heading>
    </Section>
    <Section space="md" divider>
      <Heading level={3} size="sm">
        space md
      </Heading>
    </Section>
  </div>
);
