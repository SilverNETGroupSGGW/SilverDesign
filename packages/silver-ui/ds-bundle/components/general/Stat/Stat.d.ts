import * as React from 'react';

/**
 * Stat — from @silver/ui@0.1.0.
 */
export interface StatProps {
  /** The number itself. Rendered in foil at display scale. */
  value: React.ReactNode;
  label: React.ReactNode;
  className?: string;
}

export declare const Stat: React.ComponentType<StatProps>;
