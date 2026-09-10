import * as React from 'react';

/**
 * PersonCard — from @silver/ui@0.1.0.
 */
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

export declare const PersonCard: React.ComponentType<PersonCardProps>;
