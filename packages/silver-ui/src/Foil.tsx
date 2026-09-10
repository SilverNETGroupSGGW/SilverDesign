import * as React from 'react';
import { cx } from './SilverProvider';

export interface FoilProps {
  /** `text` paints the ramp through glyphs; `surface` fills the box and flips text to dark. */
  as?: 'text' | 'surface';
  /** `bright` lifts the ramp's dark end. Use below ~24px, where the shadow end closes up. */
  ramp?: 'default' | 'bright';
  /** Element to render. Defaults to `span` for text, `div` for surface. */
  element?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Silver's one emphasis device. The system has no accent colour — brightness
 * is the accent — so this is what "highlighted" means here.
 *
 * ```tsx
 * <Heading level={1}><Foil>Budujemy oprogramowanie.</Foil></Heading>
 * ```
 */
export function Foil({
  as = 'text',
  ramp = 'default',
  element,
  className,
  style,
  children,
}: FoilProps) {
  const Tag = (element ?? (as === 'surface' ? 'div' : 'span')) as 'span';
  return (
    <Tag
      className={cx(
        as === 'surface' ? 'sv-foil-surface' : 'sv-foil-text',
        ramp === 'bright' && 'sv-foil--bright',
        className,
      )}
      style={style}
    >
      {children}
    </Tag>
  );
}
