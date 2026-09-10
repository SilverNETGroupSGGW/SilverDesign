import * as React from 'react';

/**
 * Heading — from @silver/ui@0.1.0.
 */
export interface HeadingProps {
  /** Heading rank. Also picks the default size, which `size` can override. */
  level?: 1 | 2 | 3 | 4;
  /** `display` is poster-scale and only belongs at the top of a page. */
  size?: "sm" | "md" | "lg" | "display" | "xl";
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export declare const Heading: React.ComponentType<HeadingProps>;
