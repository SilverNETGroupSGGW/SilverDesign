import * as React from 'react';

/**
 * Grid — from @silver/ui@0.1.0.
 */
export interface GridProps {
  /** Minimum column width before the grid wraps. */
  min?: number;
  gap?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export declare const Grid: React.ComponentType<GridProps>;
