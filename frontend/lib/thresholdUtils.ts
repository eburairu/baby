/**
 * WHO/小児科ガイドラインに基づく授乳・おむつ警告閾値を解決する
 *
 * 月齢ブレイクポイント（下限値で管理）:
 *   feeding: 0ヶ月=120分, 1ヶ月=150分, 3ヶ月=180分, 6ヶ月=240分
 *   diaper:  0ヶ月=180分, 1ヶ月=240分, 6ヶ月=360分
 *
 * カスタム閾値（null/undefined でない数値）が指定された場合はカスタム値を優先する。
 */

const FEEDING_THRESHOLDS: [number, number][] = [
  [6, 240],
  [3, 180],
  [1, 150],
  [0, 120],
]

const DIAPER_THRESHOLDS: [number, number][] = [
  [6, 360],
  [1, 240],
  [0, 180],
]

export function resolveThreshold(
  ageMonths: number,
  customMinutes: number | null | undefined,
  type: 'feeding' | 'diaper'
): number {
  if (customMinutes != null) {
    return customMinutes
  }

  const table = type === 'feeding' ? FEEDING_THRESHOLDS : DIAPER_THRESHOLDS
  for (const [minAge, minutes] of table) {
    if (ageMonths >= minAge) {
      return minutes
    }
  }
  // fallback（ageMonths が負の場合など）
  return table[table.length - 1][1]
}
