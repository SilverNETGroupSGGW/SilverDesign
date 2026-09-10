import * as React from 'react';

/**
 * RibbonBackdrop — from @silver/ui@0.1.0.
 */
export interface RibbonBackdropProps {
  /** Corner the ribbon's tile is anchored to. */
  position?: "center" | "top-right" | "top-left";
  /** Tile size as a multiple of container width. Below ~1.4 the bands get cut mid-air. */
  scale?: number;
  /** 0–1. Keep it low: at 27 degrees the band always crosses a hero's text column. */
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export declare const RibbonBackdrop: React.ComponentType<RibbonBackdropProps>;
