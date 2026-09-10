import * as React from 'react';
import { cx } from './SilverProvider';

export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'style'
> {
  /** `primary` is a foil fill, one per screen. `secondary` is outlined. `ghost` is bare text. */
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  /** Renders as an anchor. Pass `href` alongside. */
  href?: string;
  /** Stretches to the container's width. */
  block?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * ```tsx
 * <Button variant="primary" href="/dolacz">Dołącz do nas</Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', href, block, className, style, children, ...rest },
  ref,
) {
  const classes = cx(
    'sv-btn',
    `sv-btn--${variant}`,
    `sv-btn--${size}`,
    block && 'sv-btn--block',
    className,
  );

  if (href) {
    return (
      <a className={classes} href={href} style={style}>
        <span className="sv-btn__label">{children}</span>
      </a>
    );
  }
  return (
    <button ref={ref} className={classes} style={style} {...rest}>
      <span className="sv-btn__label">{children}</span>
    </button>
  );
});
