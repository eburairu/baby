/**
 * UI constants for the application.
 */

import { RECORD_TYPES } from '@/types/enums';

export const TOAST_DURATION_MS = 3000;
export const MOBILE_BREAKPOINT_PX = 768;

export const RECORD_TYPE_ICONS = {
  [RECORD_TYPES.FEEDING]: '🍼',
  [RECORD_TYPES.SLEEP]: '💤',
  [RECORD_TYPES.DIAPER]: '👶',
  [RECORD_TYPES.GROWTH]: '📏',
  [RECORD_TYPES.NOTE]: '📝',
  [RECORD_TYPES.CONTRACTION]: '⚡',
} as const;

export const RECORD_TYPE_LABELS = {
  [RECORD_TYPES.FEEDING]: '授乳',
  [RECORD_TYPES.SLEEP]: '睡眠',
  [RECORD_TYPES.DIAPER]: 'おむつ',
  [RECORD_TYPES.GROWTH]: '成長',
  [RECORD_TYPES.NOTE]: 'メモ',
  [RECORD_TYPES.CONTRACTION]: '陣痛',
} as const;
