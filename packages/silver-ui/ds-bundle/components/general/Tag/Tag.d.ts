import * as React from 'react';

/**
 * Tag — from @silver/ui@0.1.0.
 */
export interface TagProps {
  /** `solid` is a foil chip with dark text; `outline` is a hairline chip. */
  tone?: "outline" | "solid";
  className?: string;
  children?: React.ReactNode;
}

export declare const Tag: React.ComponentType<TagProps>;
