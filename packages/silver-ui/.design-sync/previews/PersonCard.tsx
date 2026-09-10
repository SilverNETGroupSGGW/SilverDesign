import { Grid, PersonCard } from '@silver/ui';

export const Board = () => (
  <Grid min={230} gap="md">
    <PersonCard name="Anna Kowalska" role="Przewodnicząca" />
    <PersonCard name="Michał Nowak" role="Lead, Orbit" />
    <PersonCard name="Zofia Lis" role="Warsztaty" />
    <PersonCard name="Jakub Wiśniewski" role="Skarbnik" />
  </Grid>
);

export const Initials = () => (
  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
    <PersonCard name="Anna Kowalska" role="Przewodnicząca" />
    <PersonCard name="Łukasz Żółć" initials="ŁŻ" role="DevOps" />
    <PersonCard name="Ewa" role="Grafika" />
  </div>
);

export const NoRole = () => <PersonCard name="Piotr Zając" />;
