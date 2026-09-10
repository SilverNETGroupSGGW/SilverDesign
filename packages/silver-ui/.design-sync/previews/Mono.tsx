import { Mono, Text } from '@silver/ui';

export const Inline = () => (
  <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
    <Text>
      Spotykamy się w środy o <Mono>18:00</Mono> w sali <Mono>34 / 1.40</Mono>.
    </Text>
    <Text>
      Sklonuj repo: <Mono>git clone git@github.com:silver-sggw/orbit.git</Mono>
    </Text>
  </div>
);

export const Tones = () => (
  <div style={{ display: 'grid', gap: 8 }}>
    <Mono tone="ink">ink — dane, które trzeba przeczytać</Mono>
    <Mono tone="muted">muted — kontekst</Mono>
    <Mono tone="dim">dim — wersje, znaczniki czasu</Mono>
  </div>
);
