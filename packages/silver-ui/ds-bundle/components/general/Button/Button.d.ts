import * as React from 'react';

/**
 * Button — from @silver/ui@0.1.0.
 * @replaces button
 */
export interface ButtonProps {
  /** `primary` is a foil fill, one per screen. `secondary` is outlined. `ghost` is bare text. */
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  /** Renders as an anchor. Pass `href` alongside. */
  href?: string;
  /** Stretches to the container's width. */
  block?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  id?: string;
}

export declare const Button: React.ComponentType<ButtonProps>;
