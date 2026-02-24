/**
 * Enum definitions for the application.
 */

export const RECORD_TYPES = {
  FEEDING: 'feeding',
  SLEEP: 'sleep',
  DIAPER: 'diaper',
  GROWTH: 'growth',
  NOTE: 'note',
  CONTRACTION: 'contraction',
} as const;

export type RecordType = typeof RECORD_TYPES[keyof typeof RECORD_TYPES];

export const DIAPER_STATUS = {
  WET: 'wet',
  DIRTY: 'dirty',
  BOTH: 'both',
} as const;

export type DiaperStatus = typeof DIAPER_STATUS[keyof typeof DIAPER_STATUS];

export const FEEDING_METHODS = {
  BREAST: 'breast',
  BOTTLE: 'bottle',
  PUMP: 'pump',
} as const;

export type FeedingMethod = typeof FEEDING_METHODS[keyof typeof FEEDING_METHODS];

export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
