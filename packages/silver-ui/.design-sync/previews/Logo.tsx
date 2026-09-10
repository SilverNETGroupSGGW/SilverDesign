import { Logo } from '@silver/ui';

export const Mark = () => (
  <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
    <Logo variant="mark" width={180} background />
    <Logo variant="mark" width={110} background />
  </div>
);

export const Lockups = () => (
  <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
    <Logo variant="lockup-horizontal" width={260} />
    <Logo variant="lockup-stacked" width={150} />
  </div>
);

export const Wordmark = () => (
  <div style={{ display: 'grid', gap: 24, justifyItems: 'start' }}>
    <Logo variant="wordmark" width={280} />
    <Logo variant="wordmark" width={160} />
  </div>
);

export const Icon = () => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
    <Logo variant="icon" width={64} background />
    <Logo variant="icon" width={40} background />
    <Logo variant="icon" width={28} background />
    <Logo variant="icon" width={16} background />
  </div>
);

export const Mono = () => (
  <div style={{ display: 'flex', gap: 32, alignItems: 'center', color: 'var(--ink)' }}>
    <Logo variant="mark" width={120} tone="mono" />
    <Logo variant="wordmark" width={180} tone="mono" />
  </div>
);
