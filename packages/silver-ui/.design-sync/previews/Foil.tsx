import { Foil, Heading, Text } from '@silver/ui';

export const AsText = () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <Heading level={2} size="xl">
      <Foil>Budujemy oprogramowanie</Foil>
    </Heading>
    <Text>
      Zwykły tekst dla porównania — <Foil>foil</Foil> działa też w linii.
    </Text>
  </div>
);

export const Ramps = () => (
  <div style={{ display: 'grid', gap: 18, maxWidth: 460 }}>
    <div>
      <div
        style={{
          font: '500 11px/1 var(--font-mono)',
          letterSpacing: '0.22em',
          color: 'var(--dim)',
          marginBottom: 8,
        }}
      >
        ramp default
      </div>
      <Text size="sm" style={{ margin: 0 }}>
        <Foil>Przy tym rozmiarze ciemny koniec rampy zlewa się z tłem.</Foil>
      </Text>
    </div>
    <div>
      <div
        style={{
          font: '500 11px/1 var(--font-mono)',
          letterSpacing: '0.22em',
          color: 'var(--dim)',
          marginBottom: 8,
        }}
      >
        ramp bright
      </div>
      <Text size="sm" style={{ margin: 0 }}>
        <Foil ramp="bright">Przy tym rozmiarze ciemny koniec rampy zlewa się z tłem.</Foil>
      </Text>
    </div>
    <Text size="sm" tone="dim" style={{ margin: 0 }}>
      Dlatego poniżej ~24px zawsze bright. Na dużym tekście różnica jest niewidoczna — obie rampy
      trafiają w ten sam jasny fragment arkusza.
    </Text>
  </div>
);

export const AsSurface = () => (
  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
    <Foil as="surface" style={{ padding: '20px 28px' }}>
      Panel wypełniony folią
    </Foil>
    <Foil as="surface" ramp="bright" style={{ padding: '20px 28px' }}>
      Wariant bright
    </Foil>
  </div>
);
