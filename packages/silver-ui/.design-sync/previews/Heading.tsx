import { Foil, Heading, Text } from '@silver/ui';

export const Scale = () => (
  <div style={{ display: 'grid', gap: 24 }}>
    <Heading level={1} size="display">
      Budujemy oprogramowanie
    </Heading>
    <Heading level={1} size="xl">
      Koło naukowe Silver
    </Heading>
    <Heading level={2} size="lg">
      Projekty studenckie
    </Heading>
    <Heading level={3} size="md">
      Spotkania w środy
    </Heading>
    <Heading level={4} size="sm">
      Zapisy na warsztat
    </Heading>
  </div>
);

export const WithFoil = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    <Heading level={1} size="xl">
      <Foil ramp="bright">Silver</Foil> to koło naukowe
    </Heading>
    <Text>
      Owinięcie części nagłówka w <code>Foil</code> nadaje jej metaliczny gradient. To jedyny sposób
      wyróżniania w systemie — nie ma koloru akcentu.
    </Text>
  </div>
);

export const InContext = () => (
  <div style={{ display: 'grid', gap: 12, maxWidth: 620 }}>
    <Heading level={2} size="lg">
      Czym się zajmujemy
    </Heading>
    <Text>
      Prowadzimy własne projekty od pierwszego commita do wdrożenia. Uczymy się na cudzym kodzie,
      recenzujemy swoje pull requesty i raz w semestrze pokazujemy efekty na wydziale.
    </Text>
    <Text size="sm" tone="dim">
      Polskie znaki diakrytyczne: ą ć ę ł ń ó ś ź ż — Inter ships latin-ext.
    </Text>
  </div>
);
