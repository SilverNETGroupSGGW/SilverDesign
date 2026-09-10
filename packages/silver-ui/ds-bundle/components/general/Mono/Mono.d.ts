import * as React from 'react';

/**
 * Mono — from @silver/ui@0.1.0.
 */
export interface MonoProps {
  tone?: "ink" | "muted" | "dim";
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export declare const Mono: React.ComponentType<MonoProps>;
