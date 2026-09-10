import * as React from 'react';

/**
 * Section — from @silver/ui@0.1.0.
 */
export interface SectionProps {
  /** Small mono kicker above the heading. */
  eyebrow?: React.ReactNode;
  /** Rendered as an `h2`. */
  title?: React.ReactNode;
  /** One paragraph under the heading. */
  lede?: React.ReactNode;
  /** Vertical rhythm. `lg` is a full page section, `sm` is a sub-block. */
  space?: "sm" | "md" | "lg";
  /** Draws a hairline across the top. */
  divider?: boolean;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export declare const Section: React.ComponentType<SectionProps>;
