import { format } from "date-fns";
import { ja } from "date-fns/locale";

/**
 * Formats a date to "M/d HH:mm" (e.g., 1/23 14:30).
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "M/d HH:mm", { locale: ja });
}

/**
 * Formats a date to "HH:mm" (e.g., 14:30).
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "HH:mm", { locale: ja });
}

/**
 * Formats a date to "yyyy/MM/dd HH:mm" (e.g., 2024/01/23 14:30).
 */
export function formatFullDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy/MM/dd HH:mm", { locale: ja });
}

/**
 * Formats a date to "yyyy/MM/dd" (e.g., 2024/01/23).
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy/MM/dd", { locale: ja });
}

/**
 * Formats a date to "yyyy年MM月dd日 HH:mm" (e.g., 2024年01月23日 14:30).
 */
export function formatJapaneseDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy年MM月dd日 HH:mm", { locale: ja });
}
