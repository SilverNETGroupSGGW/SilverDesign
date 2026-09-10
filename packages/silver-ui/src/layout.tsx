import * as React from 'react';
import { cx } from './SilverProvider';

/* ------------------------------------------------------------------ Section */

export interface SectionProps {
  /** Small mono kicker above the heading. */
  eyebrow?: React.ReactNode;
  /** Rendered as an `h2`. */
  title?: React.ReactNode;
  /** One paragraph under the heading. */
  lede?: React.ReactNode;
  /** Vertical rhythm. `lg` is a full page section, `sm` is a sub-block. */
  space?: 'sm' | 'md' | 'lg';
  /** Draws a hairline across the top. */
  divider?: boolean;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * A page section with the standard header block. Handles the vertical rhythm
 * so pages built from several of these line up without hand-tuned margins.
 */
export function Section({
  eyebrow,
  title,
  lede,
  space = 'lg',
  divider = false,
  id,
  className,
  style,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cx(
        'sv-section',
        `sv-section--${space}`,
        divider && 'sv-section--divider',
        className,
      )}
      style={style}
    >
      {(eyebrow || title || lede) && (
        <header className="sv-section__head">
          {eyebrow ? <p className="sv-eyebrow">{eyebrow}</p> : null}
          {title ? <h2 className="sv-heading sv-heading--lg">{title}</h2> : null}
          {lede ? (
            <p className="sv-text sv-text--lg sv-text--muted sv-text--measure">{lede}</p>
          ) : null}
        </header>
      )}
      {children}
    </section>
  );
}

/* --------------------------------------------------------------------- Grid */

export interface GridProps {
  /** Minimum column width before the grid wraps. */
  min?: number;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/** Auto-wrapping card grid. Columns are derived from `min`, never declared. */
export function Grid({ min = 280, gap = 'md', className, style, children }: GridProps) {
  return (
    <div
      className={cx('sv-grid', `sv-grid--gap-${gap}`, className)}
      style={{ ['--sv-grid-min' as string]: `${min}px`, ...style }}
    >
      {children}
    </div>
  );
}

/* --------------------------------------------------------------------- Rule */

export interface RuleProps {
  /** `angle` is the 27 degree brand tick (default). `flat` is a plain full-width hairline. */
  variant?: 'angle' | 'flat';
  /** Length in px, for the angled variant. */
  length?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Rule({ variant = 'angle', length = 120, className, style }: RuleProps) {
  return (
    <div
      className={cx('sv-rule', `sv-rule--${variant}`, className)}
      style={{ ['--sv-rule-len' as string]: `${length}px`, ...style }}
      role="separator"
    />
  );
}
