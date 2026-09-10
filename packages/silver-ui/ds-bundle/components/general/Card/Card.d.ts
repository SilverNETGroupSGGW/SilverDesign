import * as React from 'react';

/**
 * Card — from @silver/ui@0.1.0.
 */
export interface CardProps {
  /** Cuts the bottom-left corner on the brand angle. The system's card shape; leave it on. */
  cut?: boolean;
  /** Size of the corner cut, in px of horizontal run. */
  cutSize?: number;
  /** `slate` is the standard raised panel. `outline` is a hairline box with no fill, for lists of many cards. */
  tone?: "slate" | "outline";
  /** Lifts the border and background on hover. Use for cards that link. */
  interactive?: boolean;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export declare const Card: React.ComponentType<CardProps>;
