import * as React from 'react';

/**
 * Logo — from @silver/ui@0.1.0.
 */
export interface LogoProps {
  /** `mark` is the bleeding tile, `icon` is it cropped to the S, `wordmark` is SILVER alone. */
  variant?: "mark" | "icon" | "wordmark" | "lockup-horizontal" | "lockup-stacked";
  /** Rendered width in px. Height follows the variant's aspect ratio. */
  width?: number;
  /** `foil` is the metallic gradient; `mono` inherits `currentColor` for one-colour output. */
  tone?: "foil" | "mono";
  /** Paints the mark's own Graphite square behind it. Ignored by `wordmark`. */
  background?: boolean;
  /** Accessible name. Pass `''` for a purely decorative logo. */
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Logo: React.ComponentType<LogoProps>;
