import * as React from 'react';
import { cx } from './SilverProvider';

/* ------------------------------------------------------------------ Eyebrow */

export interface EyebrowProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * The small mono label that sits above a heading — category, section number,
 * kicker. Uppercase and widely tracked; it is the system's only "small caps"
 * voice and it carries a lot of the technical tone.
 */
export function Eyebrow({ className, style, children }: EyebrowProps) {
  return (
    <p className={cx('sv-eyebrow', className)} style={style}>
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ Heading */

export interface HeadingProps {
  /** Heading rank. Also picks the default size, which `size` can override. */
  level?: 1 | 2 | 3 | 4;
  /** `display` is poster-scale and only belongs at the top of a page. */
  size?: 'display' | 'xl' | 'lg' | 'md' | 'sm';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const DEFAULT_SIZE = { 1: 'xl', 2: 'lg', 3: 'md', 4: 'sm' } as const;

/**
 * Headings are tight — negative tracking, sub-1 line height — because the
 * letterforms are wide. Wrap the children in `<Foil>` to make one metallic.
 */
export function Heading({ level = 2, size, className, style, children }: HeadingProps) {
  const Tag = `h${level}` as 'h2';
  return (
    <Tag
      className={cx('sv-heading', `sv-heading--${size ?? DEFAULT_SIZE[level]}`, className)}
      style={style}
    >
      {children}
    </Tag>
  );
}

/* --------------------------------------------------------------------- Text */

export interface TextProps {
  /** `muted` for body, `dim` for metadata, `ink` for text sitting next to a heading. */
  tone?: 'muted' | 'dim' | 'ink';
  size?: 'lg' | 'md' | 'sm';
  /** Caps the measure so lines stay readable. Defaults to on. */
  measure?: boolean;
  element?: 'p' | 'div' | 'span' | 'li';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Text({
  tone = 'muted',
  size = 'md',
  measure = true,
  element: Tag = 'p',
  className,
  style,
  children,
}: TextProps) {
  return (
    <Tag
      className={cx(
        'sv-text',
        `sv-text--${size}`,
        `sv-text--${tone}`,
        measure && 'sv-text--measure',
        className,
      )}
      style={style}
    >
      {children}
    </Tag>
  );
}

/* --------------------------------------------------------------------- Mono */

export interface MonoProps {
  tone?: 'ink' | 'muted' | 'dim';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/** Monospace inline text — times, room numbers, versions, commands. */
export function Mono({ tone = 'ink', className, style, children }: MonoProps) {
  return (
    <span className={cx('sv-mono', `sv-mono--${tone}`, className)} style={style}>
      {children}
    </span>
  );
}
