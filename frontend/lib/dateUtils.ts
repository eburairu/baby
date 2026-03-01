import { format, isToday as isTodayFns, formatDistanceToNow as formatDistanceToNowFns, subMonths as subMonthsFns, subDays as subDaysFns } from "date-fns";
import { ja } from "date-fns/locale";

/**
 * Formats a date to "M/d HH:mm" (e.g., 1/23 14:30).
 */
export function formatDateTime(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "M/d HH:mm", { locale: ja });
}

/**
 * Formats a date to "HH:mm" (e.g., 14:30).
 */
export function formatTime(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "HH:mm", { locale: ja });
}

/**
 * Formats a date to "HH:mm:ss" (e.g., 14:30:45).
 */
export function formatTimeWithSeconds(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "HH:mm:ss", { locale: ja });
}

/**
 * Formats a date to "yyyy/MM/dd HH:mm" (e.g., 2024/01/23 14:30).
 */
export function formatFullDateTime(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "yyyy/MM/dd HH:mm", { locale: ja });
}

/**
 * Formats a date to "yyyy/MM/dd" (e.g., 2024/01/23).
 */
export function formatDate(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "yyyy/MM/dd", { locale: ja });
}

/**
 * Formats a date to "MM/dd" (e.g., 01/23).
 */
export function formatShortDate(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "MM/dd", { locale: ja });
}

/**
 * Formats a date to "yyyy年MM月dd日 HH:mm" (e.g., 2024年01月23日 14:30).
 */
export function formatJapaneseDateTime(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "yyyy年MM月dd日 HH:mm", { locale: ja });
}

/**
 * Formats a date to "yyyy年M月d日" (e.g., 2024年1月23日).
 */
export function formatJapaneseDate(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "yyyy年M月d日", { locale: ja });
}

/**
 * Formats a date to "yyyy/MM/dd (eee)" (e.g., 2024/01/23 (火)).
 */
export function formatDateWithDayOfWeek(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "yyyy/MM/dd (eee)", { locale: ja });
}

/**
 * Formats a date to "PPP" representation (e.g., 2024年1月23日).
 */
export function formatPPP(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "PPP", { locale: ja });
}

/**
 * Formats a date for HTML input type="datetime-local" (e.g., 2024-01-23T14:30).
 */
export function formatDateTimeLocal(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "yyyy-MM-dd'T'HH:mm", { locale: ja });
}

/**
 * Formats a date for HTML input type="date" (e.g., 2024-01-23).
 */
export function formatDateLocal(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "yyyy-MM-dd", { locale: ja });
}

/**
 * Checks if the given date is today.
 */
export function isToday(date: Date | string | number): boolean {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return isTodayFns(d);
}

/**
 * Formats distance to now (e.g., "3 hours ago", "5 mins ago").
 */
export function formatDistanceToNow(date: Date | string | number, options?: { addSuffix?: boolean }): string {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    return formatDistanceToNowFns(d, { ...options, locale: ja });
}

export function subMonths(date: Date | string | number, amount: number): Date {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    return subMonthsFns(d, amount);
}

export function subDays(date: Date | string | number, amount: number): Date {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    return subDaysFns(d, amount);
}
