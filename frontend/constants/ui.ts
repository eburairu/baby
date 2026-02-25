/**
 * UI constants for the application.
 */

import { RECORD_TYPES } from '@/types/enums';
import { Milk, Moon, Baby, TrendingUp, FileText, Zap, type LucideIcon } from 'lucide-react';

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

export const RECORD_TYPE_LUCIDE_ICONS: Record<keyof typeof RECORD_TYPE_LABELS, LucideIcon> = {
  [RECORD_TYPES.FEEDING]: Milk,
  [RECORD_TYPES.SLEEP]: Moon,
  [RECORD_TYPES.DIAPER]: Baby,
  [RECORD_TYPES.GROWTH]: TrendingUp,
  [RECORD_TYPES.NOTE]: FileText,
  [RECORD_TYPES.CONTRACTION]: Zap,
} as const;
