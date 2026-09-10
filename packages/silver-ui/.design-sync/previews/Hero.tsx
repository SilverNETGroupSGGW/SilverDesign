import { Button, Foil, Hero } from '@silver/ui';

export const Landing = () => (
  <Hero
    eyebrow="Koło naukowe · SGGW w Warszawie"
    title={<Foil ramp="bright">Budujemy oprogramowanie.</Foil>}
    lede="Silver to koło naukowe inżynierii oprogramowania. Spotykamy się co tydzień, prowadzimy własne projekty i uczymy się na nich nawzajem."
    actions={
      <>
        <Button variant="primary">Dołącz do nas</Button>
        <Button variant="secondary">Zobacz projekty</Button>
      </>
    }
  />
);

export const NoRibbon = () => (
  <Hero
    ribbon={false}
    eyebrow="Rekrutacja"
    title="Nabór otwarty do 30 listopada"
    lede="Bez rozmowy kwalifikacyjnej. Przyjdź na spotkanie i zobacz, czy to dla ciebie."
    actions={<Button variant="primary">Wypełnij formularz</Button>}
  />
);

export const NoWordmark = () => (
  <Hero
    wordmark={false}
    eyebrow="Wydarzenie"
    title="Hackathon SGGW 2026"
    lede="24 godziny, pięcioosobowe zespoły, trzy kategorie."
  />
);
