import * as React from 'react';

/**
 * EventCard — from @silver/ui@0.1.0.
 */
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

export declare const EventCard: React.ComponentType<EventCardProps>;
