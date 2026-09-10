import { EventCard, Grid } from '@silver/ui';

export const Single = () => (
  <div style={{ maxWidth: 380 }}>
    <EventCard
      date="12 LIS"
      meta="18:00 · bud. 34 / 1.40"
      title="Wprowadzenie do Rusta"
      description="Od zera do pierwszego działającego CLI w dwie godziny. Przynieś laptopa."
      tags={['Rust', 'Warsztat']}
    />
  </div>
);

export const Listing = () => (
  <Grid min={260} gap="md">
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
    />
    <EventCard
      date="26 LIS"
      meta="18:00 · online"
      title="Deploy na własnym k8s"
      description="Stawiamy klaster i wdrażamy projekt koła od zera."
      tags={['DevOps', 'Kubernetes']}
    />
  </Grid>
);

export const Linked = () => (
  <div style={{ maxWidth: 380 }}>
    <EventCard
      href="https://example.org/wydarzenia/hackathon"
      date="03 GRU"
      meta="10:00 · bud. 34, aula"
      title="Hackathon SGGW 2026"
      description="24 godziny, pięcioosobowe zespoły, trzy kategorie. Zapisy do 28 listopada."
      tags={['Hackathon', 'Zapisy']}
    />
  </div>
);

export const Minimal = () => (
  <div style={{ maxWidth: 380 }}>
    <EventCard date="Środy" title="Cotygodniowe spotkanie koła" />
  </div>
);
