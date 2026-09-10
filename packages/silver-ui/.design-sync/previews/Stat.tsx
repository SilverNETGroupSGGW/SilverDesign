import { Stat } from '@silver/ui';

export const Row = () => (
  <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
    <Stat value="120+" label="Członków" />
    <Stat value="14" label="Projektów" />
    <Stat value="2016" label="Działamy od" />
  </div>
);

export const Single = () => <Stat value="24h" label="Hackathon SGGW" />;
