/**
 * 経過時間インジケーターのユーティリティ関数
 *
 * progress = 経過時間 / 閾値（0以上、1.0超も許容）
 * 色閾値: green < 0.6 <= yellow < 0.8 <= red
 */

export const INDICATOR_COLORS = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
} as const

/**
 * 前回記録からの経過割合を返す
 * @param lastRecordTimeISO 前回記録のISO文字列（nullの場合は0を返す）
 * @param thresholdMinutes 警告閾値（分）
 * @param nowISO 現在時刻のISO文字列（省略時は Date.now() を使用）
 * @returns 0以上の数値（1.0超 = 閾値超過）
 */
export function calcProgress(
  lastRecordTimeISO: string | null,
  thresholdMinutes: number,
  nowISO?: string
): number {
  if (lastRecordTimeISO === null) {
    return 0
  }
  const now = nowISO ? new Date(nowISO).getTime() : Date.now()
  const last = new Date(lastRecordTimeISO).getTime()
  const elapsedMinutes = (now - last) / 60000
  return elapsedMinutes / thresholdMinutes
}

/**
 * 進捗率から表示色を決定する
 */
export function getIndicatorColor(progress: number): 'green' | 'yellow' | 'red' {
  if (progress < 0.6) return 'green'
  if (progress < 0.8) return 'yellow'
  return 'red'
}

/**
 * 閾値を超過しているかどうかを返す（点滅表示の判定に使用）
 */
export function isOverThreshold(progress: number): boolean {
  return progress >= 1.0
}
