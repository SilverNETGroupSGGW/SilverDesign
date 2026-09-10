import * as React from 'react';

/**
 * SilverProvider — from @silver/ui@0.1.0.
 */
export interface SilverProviderProps {
  /** Page ground. `void` is the default; `graphite` matches the mark's own background. */
  surface?: "void" | "graphite";
  /** Brushed-metal grain over the surface. On by default; stops dark areas reading flat. */
  grain?: boolean;
  /** Travels the shared foil sheet. On by default; disabled under `prefers-reduced-motion`. */
  drift?: boolean;
  /** Renders as this element instead of a div. */
  as?: "body" | "div" | "main" | "section";
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export declare const SilverProvider: React.ComponentType<SilverProviderProps>;
