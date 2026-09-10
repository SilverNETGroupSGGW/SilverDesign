import * as React from 'react';
import { createRoot } from 'react-dom/client';
import {
  Button,
  Card,
  EventCard,
  Eyebrow,
  Foil,
  Grid,
  Heading,
  Hero,
  Logo,
  Mono,
  PersonCard,
  Rule,
  Section,
  SilverProvider,
  Stat,
  Tag,
  Text,
} from '../dist/index.mjs';

function Bench({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 56 }}>
      <div
        style={{
          font: '500 11px/1 var(--font-mono)',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--dim)',
          paddingBottom: 8,
          marginBottom: 20,
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        {name}
      </div>
      {children}
    </div>
  );
}

function App() {
  return (
    <SilverProvider surface="void" drift>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px 80px' }}>
        <Hero
          eyebrow="Koło naukowe · SGGW w Warszawie"
          title={
            <>
              <Foil ramp="bright">Budujemy oprogramowanie.</Foil>
            </>
          }
          lede="Silver to koło naukowe inżynierii oprogramowania. Spotykamy się co tydzień, prowadzimy własne projekty i uczymy się na nich nawzajem."
          actions={
            <>
              <Button variant="primary">Dołącz do nas</Button>
              <Button variant="secondary">Zobacz projekty</Button>
              <Button variant="ghost">Regulamin</Button>
            </>
          }
        />

        <Bench name="Logo">
          <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
            <Logo variant="mark" width={140} background />
            <Logo variant="icon" width={56} background />
            <Logo variant="wordmark" width={200} />
            <Logo variant="lockup-horizontal" width={240} />
            <Logo variant="lockup-stacked" width={130} />
            <Logo variant="mark" width={90} tone="mono" style={{ color: 'var(--muted)' }} />
          </div>
        </Bench>

        <Bench name="Typography">
          <Eyebrow>Sekcja · 01</Eyebrow>
          <Heading level={2} size="xl">
            Wide letterforms, tight tracking
          </Heading>
          <Text size="lg" style={{ marginTop: 16 }}>
            Body copy sits in muted grey so headings keep the brightness. Emphasis comes from{' '}
            <Foil>foil</Foil>, never from hue.
          </Text>
          <Text size="sm" tone="dim" style={{ marginTop: 12 }}>
            Metadata and footnotes drop to dim. Times and rooms use{' '}
            <Mono>18:00 · bud. 34 / 1.40</Mono>.
          </Text>
          <Rule />
        </Bench>

        <Bench name="Buttons">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" size="lg">
              Dołącz
            </Button>
            <Button variant="primary">Dołącz</Button>
            <Button variant="primary" size="sm">
              Dołącz
            </Button>
            <Button variant="secondary">Projekty</Button>
            <Button variant="ghost">Więcej</Button>
          </div>
        </Bench>

        <Bench name="Cards">
          <Grid min={260} gap="md">
            <Card>
              <Eyebrow>Projekt</Eyebrow>
              <Heading level={3}>Orbit</Heading>
              <Text size="sm" style={{ marginTop: 8 }}>
                Planer zajęć dla studentów SGGW. React, Postgres, deploy na k8s.
              </Text>
            </Card>
            <Card tone="outline">
              <Eyebrow>Projekt</Eyebrow>
              <Heading level={3}>Silverbot</Heading>
              <Text size="sm" style={{ marginTop: 8 }}>
                Bot Discorda obsługujący zapisy na warsztaty i archiwum nagrań.
              </Text>
            </Card>
            <Card interactive href="#">
              <Eyebrow>Projekt</Eyebrow>
              <Heading level={3}>Kalibra</Heading>
              <Text size="sm" style={{ marginTop: 8 }}>
                Narzędzie do analizy danych pomiarowych z wydziału.
              </Text>
            </Card>
          </Grid>
        </Bench>

        <Bench name="Stats">
          <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
            <Stat value="120+" label="Członków" />
            <Stat value="14" label="Projektów" />
            <Stat value="2016" label="Od roku" />
          </div>
        </Bench>

        <Bench name="Events">
          <Grid min={280} gap="md">
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
              href="#"
            />
          </Grid>
        </Bench>

        <Bench name="People">
          <Grid min={230} gap="md">
            <PersonCard name="Anna Kowalska" role="Przewodnicząca" />
            <PersonCard name="Michał Nowak" role="Lead, Orbit" />
            <PersonCard name="Zofia Lis" role="Warsztaty" />
          </Grid>
        </Bench>

        <Bench name="Tags">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Tag>TypeScript</Tag>
            <Tag>Rust</Tag>
            <Tag>Postgres</Tag>
            <Tag tone="solid">Nabór otwarty</Tag>
          </div>
        </Bench>

        <Section
          eyebrow="Sekcja z nagłówkiem"
          title="Section składa cały blok nagłówkowy"
          lede="Eyebrow, nagłówek i lede mają wspólny rytm, więc kolejne sekcje ustawiają się bez ręcznych marginesów."
          divider
        >
          <Text size="sm" tone="dim">
            Treść sekcji.
          </Text>
        </Section>
      </div>
    </SilverProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
