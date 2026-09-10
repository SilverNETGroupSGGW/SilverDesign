import { Button } from '@silver/ui';

export const Variants = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
    <Button variant="primary">Dołącz do nas</Button>
    <Button variant="secondary">Zobacz projekty</Button>
    <Button variant="ghost">Regulamin</Button>
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
    <Button variant="primary" size="lg">
      Duży
    </Button>
    <Button variant="primary" size="md">
      Średni
    </Button>
    <Button variant="primary" size="sm">
      Mały
    </Button>
  </div>
);

export const AsLink = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
    <Button variant="primary" href="https://example.org/dolacz">
      Wypełnij formularz
    </Button>
    <Button variant="secondary" href="https://example.org/discord">
      Discord
    </Button>
  </div>
);

export const Block = () => (
  <div style={{ maxWidth: 320, display: 'grid', gap: 12 }}>
    <Button variant="primary" block>
      Zapisz się na warsztat
    </Button>
    <Button variant="secondary" block>
      Może później
    </Button>
  </div>
);

export const Disabled = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
    <Button variant="primary" disabled>
      Zapisy zamknięte
    </Button>
    <Button variant="secondary" disabled>
      Brak miejsc
    </Button>
  </div>
);
