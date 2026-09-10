import { Eyebrow, Heading, RibbonBackdrop } from '@silver/ui';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      position: 'relative',
      overflow: 'hidden',
      minHeight: 300,
      padding: 28,
      background: 'var(--graphite)',
    }}
  >
    {children}
  </div>
);

export const TopRight = () => (
  <Frame>
    <RibbonBackdrop position="top-right" opacity={0.5} />
    <div style={{ position: 'relative', zIndex: 2 }}>
      <Eyebrow>position top-right</Eyebrow>
      <Heading level={3} size="md">
        Tekst zostaje czytelny
      </Heading>
    </div>
  </Frame>
);

export const TopLeft = () => (
  <Frame>
    <RibbonBackdrop position="top-left" opacity={0.5} />
    <div style={{ position: 'relative', zIndex: 2 }}>
      <Eyebrow>position top-left</Eyebrow>
    </div>
  </Frame>
);

export const Centered = () => (
  <Frame>
    <RibbonBackdrop position="center" scale={1.2} opacity={0.7} />
    <div style={{ position: 'relative', zIndex: 2 }}>
      <Eyebrow>position center</Eyebrow>
    </div>
  </Frame>
);

export const Opacities = () => (
  <div style={{ display: 'grid', gap: 12 }}>
    <Frame>
      <RibbonBackdrop opacity={1} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Eyebrow>opacity 1 — tylko bez tekstu</Eyebrow>
      </div>
    </Frame>
    <Frame>
      <RibbonBackdrop opacity={0.3} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Eyebrow>opacity 0.3 — pod tekstem</Eyebrow>
      </div>
    </Frame>
  </div>
);
