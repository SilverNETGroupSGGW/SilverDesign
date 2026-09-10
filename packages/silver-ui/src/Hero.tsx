import * as React from 'react';
import { Logo } from './Logo';
import { cx } from './SilverProvider';

export interface RibbonBackdropProps {
  /** Corner the ribbon's tile is anchored to. */
  position?: 'top-right' | 'top-left' | 'center';
  /** Tile size as a multiple of container width. Below ~1.4 the bands get cut mid-air. */
  scale?: number;
  /** 0–1. Keep it low: at 27 degrees the band always crosses a hero's text column. */
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * The mark bled across a container as decoration. Absolutely positioned, so
 * the parent needs `position: relative` — `Hero` already does this.
 */
export function RibbonBackdrop({
  position = 'top-right',
  scale = 1.7,
  opacity = 1,
  className,
  style,
}: RibbonBackdropProps) {
  return (
    <div
      className={cx('sv-ribbon', `sv-ribbon--${position}`, className)}
      style={{ ['--sv-ribbon-scale' as string]: String(scale), opacity, ...style }}
      aria-hidden="true"
    >
      <Logo variant="mark" title="" className="sv-ribbon__art" />
    </div>
  );
}

export interface HeroProps {
  eyebrow?: React.ReactNode;
  /** The headline. Wrap part of it in `<Foil>` to make it metallic. */
  title: React.ReactNode;
  lede?: React.ReactNode;
  /** Buttons, usually. */
  actions?: React.ReactNode;
  /** Shows the wordmark above the eyebrow. Turn off when a header already carries the logo. */
  wordmark?: boolean;
  /** Turns off the bled ribbon, for a text-only hero. */
  ribbon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * The page opener: bled ribbon behind, wordmark and headline in front. This
 * is the composition the posters use, so a landing page and a printed sheet
 * read as the same thing.
 *
 * ```tsx
 * <Hero
 *   eyebrow="Koło naukowe · SGGW"
 *   title={<><Foil>Budujemy oprogramowanie.</Foil> Od zera.</>}
 *   lede="Spotykamy się co tydzień i budujemy własne projekty."
 *   actions={<Button variant="primary">Dołącz</Button>}
 * />
 * ```
 */
export function Hero({
  eyebrow,
  title,
  lede,
  actions,
  wordmark = true,
  ribbon = true,
  className,
  children,
}: HeroProps) {
  return (
    <header className={cx('sv-hero', className)}>
      {ribbon ? <RibbonBackdrop position="top-right" opacity={0.4} /> : null}
      <div className="sv-hero__inner">
        {wordmark ? <Logo variant="wordmark" width={150} className="sv-hero__wordmark" /> : null}
        {eyebrow ? <p className="sv-eyebrow">{eyebrow}</p> : null}
        <h1 className="sv-heading sv-heading--display">{title}</h1>
        {lede ? (
          <p className="sv-text sv-text--lg sv-text--muted sv-text--measure">{lede}</p>
        ) : null}
        {actions ? <div className="sv-hero__actions">{actions}</div> : null}
        {children}
      </div>
    </header>
  );
}
