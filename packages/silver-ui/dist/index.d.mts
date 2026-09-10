import * as React from "react";
//#region src/SilverProvider.d.ts
interface SilverProviderProps {
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
declare const SilverProvider: React.ForwardRefExoticComponent<SilverProviderProps & React.RefAttributes<HTMLDivElement>>;
declare function cx(...parts: Array<string | false | null | undefined>): string;
//#endregion
//#region src/Logo.d.ts
type LogoVariant = 'mark' | 'icon' | 'wordmark' | 'lockup-horizontal' | 'lockup-stacked';
interface LogoProps {
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
/**
 * The Silver logo, drawn inline. Nothing is fetched, so it renders correctly
 * wherever it lands.
 */
declare function Logo({ variant, width, tone, background, title, className, style }: LogoProps): React.JSX.Element;
//#endregion
//#region src/Foil.d.ts
interface FoilProps {
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
declare function Foil({ as, ramp, element, className, style, children }: FoilProps): React.JSX.Element;
//#endregion
//#region src/typography.d.ts
interface EyebrowProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
/**
 * The small mono label that sits above a heading — category, section number,
 * kicker. Uppercase and widely tracked; it is the system's only "small caps"
 * voice and it carries a lot of the technical tone.
 */
declare function Eyebrow({ className, style, children }: EyebrowProps): React.JSX.Element;
interface HeadingProps {
  /** Heading rank. Also picks the default size, which `size` can override. */
  level?: 1 | 2 | 3 | 4;
  /** `display` is poster-scale and only belongs at the top of a page. */
  size?: 'display' | 'xl' | 'lg' | 'md' | 'sm';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
/**
 * Headings are tight — negative tracking, sub-1 line height — because the
 * letterforms are wide. Wrap the children in `<Foil>` to make one metallic.
 */
declare function Heading({ level, size, className, style, children }: HeadingProps): React.JSX.Element;
interface TextProps {
  /** `muted` for body, `dim` for metadata, `ink` for text sitting next to a heading. */
  tone?: 'muted' | 'dim' | 'ink';
  size?: 'lg' | 'md' | 'sm';
  /** Caps the measure so lines stay readable. Defaults to on. */
  measure?: boolean;
  element?: 'p' | 'div' | 'span' | 'li';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
declare function Text({ tone, size, measure, element: Tag, className, style, children }: TextProps): React.JSX.Element;
interface MonoProps {
  tone?: 'ink' | 'muted' | 'dim';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
/** Monospace inline text — times, room numbers, versions, commands. */
declare function Mono({ tone, className, style, children }: MonoProps): React.JSX.Element;
//#endregion
//#region src/Button.d.ts
interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'> {
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
declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
//#endregion
//#region src/Card.d.ts
interface CardProps {
  /** Cuts the bottom-left corner on the brand angle. The system's card shape; leave it on. */
  cut?: boolean;
  /** Size of the corner cut, in px of horizontal run. */
  cutSize?: number;
  /** `slate` is the standard raised panel. `outline` is a hairline box with
   *  no fill, for lists of many cards. */
  tone?: 'slate' | 'outline';
  /** Lifts the border and background on hover. Use for cards that link. */
  interactive?: boolean;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
/**
 * The container everything else sits in — Discord announcements, project
 * tiles, event listings.
 *
 * ```tsx
 * <Card interactive href="/projekty/orbit">
 *   <Eyebrow>Projekt</Eyebrow>
 *   <Heading level={3}>Orbit</Heading>
 * </Card>
 * ```
 */
declare function Card({ cut, cutSize, tone, interactive, href, className, style, children }: CardProps): React.JSX.Element;
//#endregion
//#region src/layout.d.ts
interface SectionProps {
  /** Small mono kicker above the heading. */
  eyebrow?: React.ReactNode;
  /** Rendered as an `h2`. */
  title?: React.ReactNode;
  /** One paragraph under the heading. */
  lede?: React.ReactNode;
  /** Vertical rhythm. `lg` is a full page section, `sm` is a sub-block. */
  space?: 'sm' | 'md' | 'lg';
  /** Draws a hairline across the top. */
  divider?: boolean;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
/**
 * A page section with the standard header block. Handles the vertical rhythm
 * so pages built from several of these line up without hand-tuned margins.
 */
declare function Section({ eyebrow, title, lede, space, divider, id, className, style, children }: SectionProps): React.JSX.Element;
interface GridProps {
  /** Minimum column width before the grid wraps. */
  min?: number;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
/** Auto-wrapping card grid. Columns are derived from `min`, never declared. */
declare function Grid({ min, gap, className, style, children }: GridProps): React.JSX.Element;
interface RuleProps {
  /** `angle` is the 27 degree brand tick (default). `flat` is a plain full-width hairline. */
  variant?: 'angle' | 'flat';
  /** Length in px, for the angled variant. */
  length?: number;
  className?: string;
  style?: React.CSSProperties;
}
declare function Rule({ variant, length, className, style }: RuleProps): React.JSX.Element;
//#endregion
//#region src/content.d.ts
interface TagProps {
  /** `solid` is a foil chip with dark text; `outline` is a hairline chip. */
  tone?: 'outline' | 'solid';
  className?: string;
  children?: React.ReactNode;
}
/** Small mono chip — a tech stack label, a difficulty, a status. */
declare function Tag$1({ tone, className, children }: TagProps): React.JSX.Element;
interface StatProps {
  /** The number itself. Rendered in foil at display scale. */
  value: React.ReactNode;
  label: React.ReactNode;
  className?: string;
}
/** A single headline figure — members, projects shipped, years running. */
declare function Stat({ value, label, className }: StatProps): React.JSX.Element;
interface EventCardProps {
  /** Short date, e.g. "12 LIS" or "12 NOV". Set in mono at the top. */
  date: React.ReactNode;
  /** Time and room, e.g. "18:00 · bud. 34 / 1.40". */
  meta?: React.ReactNode;
  title: React.ReactNode;
  /** One or two lines on what the meeting covers. */
  description?: React.ReactNode;
  /** Tech or topic chips along the bottom. */
  tags?: string[];
  href?: string;
  className?: string;
}
/**
 * A meeting, workshop, or talk. The date sits above the title in mono so a
 * column of these scans by date.
 */
declare function EventCard({ date, meta, title, description, tags, href, className }: EventCardProps): React.JSX.Element;
interface PersonCardProps {
  name: React.ReactNode;
  /** Role in the club, e.g. "Przewodniczący" or "Lead, Orbit". */
  role?: React.ReactNode;
  /** Photo URL. Without one the initials are shown on a foil tile. */
  photo?: string;
  /** Falls back to the first letters of `name` when no photo is given. */
  initials?: string;
  className?: string;
}
/** A board member or project lead. */
declare function PersonCard({ name, role, photo, initials, className }: PersonCardProps): React.JSX.Element;
//#endregion
//#region src/Hero.d.ts
interface RibbonBackdropProps {
  /** Corner the ribbon's tile is anchored to. */
  position?: 'top-right' | 'top-left' | 'center';
  /** Tile size as a multiple of container width. Below ~1.4 the bands get cut mid-air. */
  scale?: number;
  /** 0–1. Keep it low: at 27 degrees the band always crosses a hero's text column. */
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}
/**
 * The mark bled across a container as decoration. Absolutely positioned, so
 * the parent needs `position: relative` — `Hero` already does this.
 */
declare function RibbonBackdrop({ position, scale, opacity, className, style }: RibbonBackdropProps): React.JSX.Element;
interface HeroProps {
  eyebrow?: React.ReactNode;
  /** The headline. Wrap part of it in `<Foil>` to make it metallic. */
  title: React.ReactNode;
  lede?: React.ReactNode;
  /** Buttons, usually. */
  actions?: React.ReactNode;
  /** Shows the wordmark above the eyebrow. Turn off when a header already carries the logo. */
  wordmark?: boolean;
  /** Turns off the bled ribbon, for a text-only hero. */
  ribbon?: boolean;
  className?: string;
  children?: React.ReactNode;
}
/**
 * The page opener: bled ribbon behind, wordmark and headline in front. This
 * is the composition the posters use, so a landing page and a printed sheet
 * read as the same thing.
 *
 * ```tsx
 * <Hero
 *   eyebrow="Koło naukowe · SGGW"
 *   title={<><Foil>Budujemy oprogramowanie.</Foil> Od zera.</>}
 *   lede="Spotykamy się co tydzień i budujemy własne projekty."
 *   actions={<Button variant="primary">Dołącz</Button>}
 * />
 * ```
 */
declare function Hero({ eyebrow, title, lede, actions, wordmark, ribbon, className, children }: HeroProps): React.JSX.Element;
//#endregion
//#region src/logo-paths.d.ts
/** The brand angle, in degrees. Every diagonal in the system is this angle. */
declare const BRAND_ANGLE = 27.07;
//#endregion
export { BRAND_ANGLE, Button, type ButtonProps, Card, type CardProps, EventCard, type EventCardProps, Eyebrow, type EyebrowProps, Foil, type FoilProps, Grid, type GridProps, Heading, type HeadingProps, Hero, type HeroProps, Logo, type LogoProps, type LogoVariant, Mono, type MonoProps, PersonCard, type PersonCardProps, RibbonBackdrop, type RibbonBackdropProps, Rule, type RuleProps, Section, type SectionProps, SilverProvider, type SilverProviderProps, Stat, type StatProps, Tag$1 as Tag, type TagProps, Text, type TextProps, cx };
//# sourceMappingURL=index.d.mts.map