import * as React from 'react';

/**
 * Rule — from @silver/ui@0.1.0.
 */
export interface RuleProps {
  /** `angle` is the 27 degree brand tick (default). `flat` is a plain full-width hairline. */
  variant?: "angle" | "flat";
  /** Length in px, for the angled variant. */
  length?: number;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Rule: React.ComponentType<RuleProps>;
