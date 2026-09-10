import * as React from 'react';
import {
  BRAND_ANGLE,
  ICON_VIEWBOX,
  LOCKUPS,
  MARK_PATH,
  MARK_VIEWBOX,
  WORDMARK_PATH,
  WORDMARK_VIEWBOX,
  type Lockup,
  type ViewBox,
} from './logo-paths';
import { cx } from './SilverProvider';

let uid = 0;

export type LogoVariant = 'mark' | 'icon' | 'wordmark' | 'lockup-horizontal' | 'lockup-stacked';

export interface LogoProps {
  /** `mark` is the bleeding tile, `icon` is it cropped to the S, `wordmark` is SILVER alone. */
  variant?: LogoVariant;
  /** Rendered width in px. Height follows the variant's aspect ratio. */
  width?: number;
  /** `foil` is the metallic gradient; `mono` inherits `currentColor` for one-colour output. */
  tone?: 'foil' | 'mono';
  /** Paints the mark's own Graphite square behind it. Ignored by `wordmark`. */
  background?: boolean;
  /** Accessible name. Pass `''` for a purely decorative logo. */
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_WIDTH: Record<LogoVariant, number> = {
  mark: 160,
  icon: 40,
  wordmark: 220,
  'lockup-horizontal': 240,
  'lockup-stacked': 150,
};

/**
 * The Silver logo, drawn inline. Nothing is fetched, so it renders correctly
 * wherever it lands.
 */
export function Logo({
  variant = 'mark',
  width,
  tone = 'foil',
  background = false,
  title = 'Silver',
  className,
  style,
}: LogoProps) {
  const gradientId = React.useMemo(() => `sv-foil-${++uid}`, []);
  const fill = tone === 'foil' ? `url(#${gradientId})` : 'currentColor';

  const lockup: Lockup | null =
    variant === 'lockup-horizontal'
      ? LOCKUPS.horizontal
      : variant === 'lockup-stacked'
        ? LOCKUPS.stacked
        : null;

  const box: ViewBox = lockup
    ? lockup.viewBox
    : variant === 'wordmark'
      ? WORDMARK_VIEWBOX
      : variant === 'icon'
        ? ICON_VIEWBOX
        : MARK_VIEWBOX;

  const [minX, minY, vw, vh] = box;
  const w = width ?? DEFAULT_WIDTH[variant];
  const axis = gradientAxis(box);

  return (
    <svg
      className={cx('sv-logo', className)}
      viewBox={`${minX} ${minY} ${vw} ${vh}`}
      width={w}
      height={(w * vh) / vw}
      role={title ? 'img' : 'presentation'}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      style={style}
    >
      {title ? <title>{title}</title> : null}

      {tone === 'foil' ? (
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1={axis.x1}
            y1={axis.y1}
            x2={axis.x2}
            y2={axis.y2}
          >
            <stop offset="0" stopColor="#5C6067" />
            <stop offset="0.24" stopColor="#9FA3AA" />
            <stop offset="0.46" stopColor="#EFF1F4" />
            <stop offset="0.63" stopColor="#A8ACB3" />
            <stop offset="0.82" stopColor="#6F737A" />
            <stop offset="1" stopColor="#CDD0D5" />
          </linearGradient>
        </defs>
      ) : null}

      {lockup ? (
        <>
          {/* Solid rounded tile. It used to be a sharp-cornered outline, which
              both dated the lockup and fought the radius scale. The one-colour
              tone has no fill to invert against, so the ribbon carries it. */}
          {tone === 'foil' ? (
            <rect
              x={lockup.tile[0]}
              y={lockup.tile[1]}
              width={lockup.tile[2]}
              height={lockup.tile[2]}
              rx={lockup.tileRadius}
              fill="#15171B"
            />
          ) : null}
          <clipPath id={`${gradientId}-tile`}>
            <rect
              x={lockup.tile[0]}
              y={lockup.tile[1]}
              width={lockup.tile[2]}
              height={lockup.tile[2]}
              rx={lockup.tileRadius}
            />
          </clipPath>
          <g clipPath={`url(#${gradientId}-tile)`}>
            <path d={lockup.mark} fill={fill} />
          </g>
          <path d={lockup.word} fill={fill} />
        </>
      ) : (
        <>
          {background && variant !== 'wordmark' ? (
            <rect x={minX} y={minY} width={vw} height={vh} fill="#15171B" />
          ) : null}
          <path d={variant === 'wordmark' ? WORDMARK_PATH : MARK_PATH} fill={fill} />
        </>
      )}
    </svg>
  );
}

const ANGLE = (BRAND_ANGLE * Math.PI) / 180;

/**
 * The gradient runs along the brand angle. Projecting the viewBox's corners
 * onto that angle keeps the ramp's stops in the same place at every aspect
 * ratio, so a favicon and a poster show the same slice of metal.
 */
function gradientAxis([minX, minY, w, h]: ViewBox) {
  const ux = Math.cos(ANGLE);
  const uy = -Math.sin(ANGLE); // y grows downward in SVG
  const project = (x: number, y: number) => x * ux + y * uy;

  const corners = [
    project(minX, minY),
    project(minX + w, minY),
    project(minX, minY + h),
    project(minX + w, minY + h),
  ];
  const lo = Math.min(...corners);
  const hi = Math.max(...corners);

  const cx = minX + w / 2;
  const cy = minY + h / 2;
  const centre = project(cx, cy);
  const round = (n: number) => Math.round(n * 100) / 100;

  return {
    x1: round(cx + ux * (lo - centre)),
    y1: round(cy + uy * (lo - centre)),
    x2: round(cx + ux * (hi - centre)),
    y2: round(cy + uy * (hi - centre)),
  };
}
