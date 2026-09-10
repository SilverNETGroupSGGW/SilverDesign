import * as React from 'react';
import { cx } from './SilverProvider';

export interface CardProps {
  /** Cuts the bottom-left corner on the brand angle. The system's card shape; leave it on. */
  cut?: boolean;
  /** Size of the corner cut, in px of horizontal run. */
  cutSize?: number;
  /** `slate` is the standard raised panel. `outline` is a hairline box with
   *  no fill, for lists of many cards. */
  tone?: 'slate' | 'outline';
  /** Lifts the border and background on hover. Use for cards that link. */
  interactive?: boolean;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * The container everything else sits in — Discord announcements, project
 * tiles, event listings.
 *
 * ```tsx
 * <Card interactive href="/projekty/orbit">
 *   <Eyebrow>Projekt</Eyebrow>
 *   <Heading level={3}>Orbit</Heading>
 * </Card>
 * ```
 */
export function Card({
  cut = true,
  cutSize = 56,
  tone = 'slate',
  interactive = false,
  href,
  className,
  style,
  children,
}: CardProps) {
  const classes = cx(
    'sv-card',
    `sv-card--${tone}`,
    cut && 'sv-card--cut',
    (interactive || href) && 'sv-card--interactive',
    className,
  );
  const css: React.CSSProperties = { ['--sv-cut' as string]: `${cutSize}px`, ...style };

  if (href) {
    return (
      <a className={classes} href={href} style={css}>
        {children}
      </a>
    );
  }
  return (
    <div className={classes} style={css}>
      {children}
    </div>
  );
}
