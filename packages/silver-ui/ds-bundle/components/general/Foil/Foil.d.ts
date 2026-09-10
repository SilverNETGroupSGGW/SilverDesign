import * as React from 'react';

/**
 * Foil — from @silver/ui@0.1.0.
 */
export interface FoilProps {
  /** `text` paints the ramp through glyphs; `surface` fills the box and flips text to dark. */
  as?: "text" | "surface";
  /** `bright` lifts the ramp's dark end. Use below ~24px, where the shadow end closes up. */
  ramp?: "default" | "bright";
  /** Element to render. Defaults to `span` for text, `div` for surface. */
  element?: "symbol" | "object" | "style" | "form" | "slot" | "title" | "text" | "a" | "abbr" | "address" | "area" | "article" | "aside" | "audio" | "b" | "base" | (string & {}) /* +162 more */;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export declare const Foil: React.ComponentType<FoilProps>;
