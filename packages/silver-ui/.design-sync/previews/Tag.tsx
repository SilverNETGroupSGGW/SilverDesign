import { Tag } from '@silver/ui';

export const Tones = () => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
    <Tag>TypeScript</Tag>
    <Tag>Rust</Tag>
    <Tag>Postgres</Tag>
    <Tag tone="solid">Nabór otwarty</Tag>
  </div>
);

export const Stack = () => (
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 320 }}>
    <Tag>React</Tag>
    <Tag>Vite</Tag>
    <Tag>Kubernetes</Tag>
    <Tag>Python</Tag>
    <Tag>Pandas</Tag>
    <Tag>Figma</Tag>
  </div>
);
