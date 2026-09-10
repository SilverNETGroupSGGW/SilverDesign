import * as React from 'react';

export interface SilverProviderProps {
  /** Page ground. `void` is the default; `graphite` matches the mark's own background. */
  surface?: 'void' | 'graphite';
  /** Brushed-metal grain over the surface. On by default; stops dark areas reading flat. */
  grain?: boolean;
  /** Travels the shared foil sheet. On by default; disabled under `prefers-reduced-motion`. */
  drift?: boolean;
  /** Renders as this element instead of a div. */
  as?: 'div' | 'main' | 'body' | 'section';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Root wrapper for anything built with Silver. Every other component reads
 * its colours, type and spacing from CSS custom properties that live on this
 * element — without it components render with no tokens and fall back to
 * browser defaults.
 *
 * It also owns the foil sheet. Foil is one continuous surface behind the
 * page rather than a fill repeated per element, and `drift` animates that
 * one sheet here — never on the elements sampling it.
 *
 * Wrap the whole app once, at the top:
 *
 * ```tsx
 * <SilverProvider surface="void">
 *   <Section>…</Section>
 * </SilverProvider>
 * ```
 */
export const SilverProvider = React.forwardRef<HTMLDivElement, SilverProviderProps>(
  function SilverProvider(
    { surface = 'void', grain = true, drift = true, as: Tag = 'div', className, style, children },
    ref,
  ) {
    return (
      <Tag
        ref={ref as never}
        data-silver-surface={surface}
        className={cx('sv-root', grain && 'sv-root--grain', drift && 'sv-root--drift', className)}
        style={style}
      >
        {children}
      </Tag>
    );
  },
);

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
