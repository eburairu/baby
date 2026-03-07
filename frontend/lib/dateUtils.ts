import { format, isToday as isTodayFns, formatDistanceToNow as formatDistanceToNowFns, subMonths as subMonthsFns, subDays as subDaysFns, isSameDay as isSameDayFns, differenceInMinutes as differenceInMinutesFns, parseISO as parseISOFns } from "date-fns";
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
 * Formats a date to "PPP" with Japanese locale (e.g., 2024年1月23日).
 */
export function formatJapaneseDatePPP(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "PPP", { locale: ja });
}

/**
 * Formats a date to "MM/dd" (e.g., 01/23).
 */
export function formatMonthDay(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "MM/dd", { locale: ja });
}

/**
 * Formats a date to "yyyy/MM/dd (eee)" (e.g., 2024/01/23 (火)).
 */
export function formatDateWithWeekday(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "yyyy/MM/dd (eee)", { locale: ja });
}

/**
 * Formats a date to "HH:mm:ss" (e.g., 14:30:45).
 */
export function formatTimeWithSeconds(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "HH:mm:ss", { locale: ja });
}

/**
 * Returns the distance between the given date and now in words.
 */
export function formatTimeAgo(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return formatDistanceToNowFns(d, { addSuffix: true, locale: ja });
}

/**
 * Subtracts the given number of months from the given date.
 */
export function subtractMonths(date: Date | string | number, amount: number): Date {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return subMonthsFns(d, amount);
}

/**
 * Subtracts the given number of days from the given date.
 */
export function subtractDays(date: Date | string | number, amount: number): Date {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return subDaysFns(d, amount);
}


/**
 * Checks if two dates are the same day.
 */
export function isSameDay(dateLeft: Date | string | number, dateRight: Date | string | number): boolean {
  const dLeft = typeof dateLeft === "string" || typeof dateLeft === "number" ? new Date(dateLeft) : dateLeft;
  const dRight = typeof dateRight === "string" || typeof dateRight === "number" ? new Date(dateRight) : dateRight;
  return isSameDayFns(dLeft, dRight);
}

/**
 * Gets the number of minutes between the given dates.
 */
export function differenceInMinutes(dateLeft: Date | string | number, dateRight: Date | string | number): number {
  const dLeft = typeof dateLeft === "string" || typeof dateLeft === "number" ? new Date(dateLeft) : dateLeft;
  const dRight = typeof dateRight === "string" || typeof dateRight === "number" ? new Date(dateRight) : dateRight;
  return differenceInMinutesFns(dLeft, dRight);
}

/**
 * Parses an ISO 8601 string to a Date object.
 */
export function parseISO(dateString: string): Date {
  return parseISOFns(dateString);
}

/**
 * Formats a date to "M/d" (e.g., 1/23).
 */
export function formatMonthDaySlash(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, "M/d", { locale: ja });
}
