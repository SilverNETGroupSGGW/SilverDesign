import * as React from 'react';

/**
 * Hero — from @silver/ui@0.1.0.
 */
export interface HeroProps {
  eyebrow?: React.ReactNode;
  /** The headline. Wrap part of it in `<Foil>` to make it metallic. */
  title: React.ReactNode;
  lede?: React.ReactNode;
  /** Buttons, usually. */
  actions?: React.ReactNode;
  /** Shows the wordmark above the eyebrow. Turn off when a header already carries the logo. */
  wordmark?: boolean;
  /** Turns off the bled ribbon, for a text-only hero. */
  ribbon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export declare const Hero: React.ComponentType<HeroProps>;
