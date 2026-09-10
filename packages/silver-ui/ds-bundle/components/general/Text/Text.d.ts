import * as React from 'react';

/**
 * Text — from @silver/ui@0.1.0.
 */
export interface TextProps {
  /** `muted` for body, `dim` for metadata, `ink` for text sitting next to a heading. */
  tone?: "ink" | "muted" | "dim";
  size?: "sm" | "md" | "lg";
  /** Caps the measure so lines stay readable. Defaults to on. */
  measure?: boolean;
  element?: "div" | "li" | "p" | "span";
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export declare const Text: React.ComponentType<TextProps>;
