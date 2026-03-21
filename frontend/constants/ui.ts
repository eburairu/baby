/**
 * UI constants for the application.
 */

import { RECORD_TYPES } from '@/types/enums';
import { type LucideIcon } from 'lucide-react';
import { RECORD_TYPE_ICONS } from './icons';

export const TOAST_DURATION_MS = 3000;
export const SWR_REFRESH_INTERVAL_MS = 30000;
export const MOBILE_BREAKPOINT_PX = 768;

export const RECORD_TYPE_LABELS = {
  [RECORD_TYPES.FEEDING]: '授乳',
  [RECORD_TYPES.SLEEP]: '睡眠',
  [RECORD_TYPES.DIAPER]: 'おむつ',
  [RECORD_TYPES.GROWTH]: '成長',
  [RECORD_TYPES.NOTE]: 'メモ',
  [RECORD_TYPES.CONTRACTION]: '陣痛',
} as const;

export const RECORD_TYPE_COLORS = {
  [RECORD_TYPES.FEEDING]: 'text-rose-500 dark:text-rose-400',
  [RECORD_TYPES.SLEEP]: 'text-indigo-500 dark:text-indigo-400',
  [RECORD_TYPES.DIAPER]: 'text-amber-500 dark:text-amber-400',
  [RECORD_TYPES.GROWTH]: 'text-emerald-500 dark:text-emerald-400',
  [RECORD_TYPES.NOTE]: 'text-blue-500 dark:text-blue-400',
  [RECORD_TYPES.CONTRACTION]: 'text-orange-500 dark:text-orange-400',
} as const;

export const RECORD_TYPE_BG_COLORS = {
  [RECORD_TYPES.FEEDING]: 'text-orange-100 dark:text-orange-950/40',
  [RECORD_TYPES.SLEEP]: 'text-indigo-100 dark:text-indigo-950/40',
  [RECORD_TYPES.DIAPER]: 'text-amber-100 dark:text-amber-950/40',
  [RECORD_TYPES.GROWTH]: 'text-green-100 dark:text-green-950/40',
  [RECORD_TYPES.NOTE]: 'text-blue-100 dark:text-blue-950/40',
  [RECORD_TYPES.CONTRACTION]: 'text-orange-100 dark:text-orange-950/40',
} as const;

export const RECORD_TYPE_LUCIDE_ICONS: Record<keyof typeof RECORD_TYPE_LABELS, LucideIcon> = RECORD_TYPE_ICONS;

export const ROLE_LABELS: Record<string, string> = {
  admin: '管理者',
  member: 'メンバー',
  viewer: '閲覧者',
} as const;

export const GENDER_LABELS: Record<string, string> = {
  boy: '男の子',
  girl: '女の子',
  unknown: '不明',
} as const;
