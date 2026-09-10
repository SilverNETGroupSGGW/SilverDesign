import * as React from 'react';
import { Card } from './Card';
import { cx } from './SilverProvider';

/* --------------------------------------------------------------------- Tag */

export interface TagProps {
  /** `solid` is a foil chip with dark text; `outline` is a hairline chip. */
  tone?: 'outline' | 'solid';
  className?: string;
  children?: React.ReactNode;
}

/** Small mono chip — a tech stack label, a difficulty, a status. */
export function Tag({ tone = 'outline', className, children }: TagProps) {
  return <span className={cx('sv-tag', `sv-tag--${tone}`, className)}>{children}</span>;
}

/* -------------------------------------------------------------------- Stat */

export interface StatProps {
  /** The number itself. Rendered in foil at display scale. */
  value: React.ReactNode;
  label: React.ReactNode;
  className?: string;
}

/** A single headline figure — members, projects shipped, years running. */
export function Stat({ value, label, className }: StatProps) {
  return (
    <div className={cx('sv-stat', className)}>
      <div className="sv-stat__value sv-foil-text sv-foil--bright">{value}</div>
      <div className="sv-stat__label">{label}</div>
    </div>
  );
}

/* --------------------------------------------------------------- EventCard */

export interface EventCardProps {
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
export function EventCard({
  date,
  meta,
  title,
  description,
  tags,
  href,
  className,
}: EventCardProps) {
  return (
    <Card href={href} interactive={!!href} className={cx('sv-event', className)}>
      <div className="sv-event__when">
        <span className="sv-event__date">{date}</span>
        {meta ? <span className="sv-event__meta">{meta}</span> : null}
      </div>
      <h3 className="sv-heading sv-heading--sm sv-event__title">{title}</h3>
      {description ? <p className="sv-text sv-text--sm sv-text--muted">{description}</p> : null}
      {tags?.length ? (
        <div className="sv-event__tags">
          {tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

/* -------------------------------------------------------------- PersonCard */

export interface PersonCardProps {
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
export function PersonCard({ name, role, photo, initials, className }: PersonCardProps) {
  const fallback =
    initials ??
    String(typeof name === 'string' ? name : '')
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <div className={cx('sv-person', className)}>
      {photo ? (
        <img className="sv-person__photo" src={photo} alt="" />
      ) : (
        <div className="sv-person__photo sv-person__photo--initials">{fallback}</div>
      )}
      <div>
        <div className="sv-person__name">{name}</div>
        {role ? <div className="sv-person__role">{role}</div> : null}
      </div>
    </div>
  );
}
