import { subDays, isSameDay, differenceInMinutes, parseISO } from "date-fns"

export interface RhythmPoint {
    dayOffset: number    // 0=今日, 1=昨日, ..., 6=6日前
    timeMinutes: number  // 0〜1439 (0:00〜23:59を分単位)
    label: string        // ツールチップ表示テキスト
    color?: string       // 記録タイプ別カラー
}

/**
 * タイムスタンプ配列をリズムチャート用の散布図データに変換する。
 * @param items 変換元の記録配列
 * @param todayStr "YYYY-MM-DD" 形式の基準日（テスト容易性のため引数で受け取る）
 * @param days 表示する日数（デフォルト 7）
 */
export function buildRhythmData(
    items: { timestamp: string; label: string; color?: string }[],
    todayStr: string,
    days = 7,
): RhythmPoint[] {
    const today = parseISO(todayStr)
    const result: RhythmPoint[] = []

    for (const item of items) {
        const dt = parseISO(item.timestamp)
        let dayOffset = -1

        for (let i = 0; i < days; i++) {
            if (isSameDay(dt, subDays(today, i))) {
                dayOffset = i
                break
            }
        }

        if (dayOffset === -1) continue

        // Convert UTC time to JST (+09:00) and get hours/minutes
        // as the test and application expect JST rhythm data
        const jstDate = new Date(dt.getTime() + 9 * 60 * 60 * 1000)
        const timeMinutes = jstDate.getUTCHours() * 60 + jstDate.getUTCMinutes()

        result.push({
            dayOffset,
            timeMinutes,
            label: item.label,
            ...(item.color !== undefined ? { color: item.color } : {}),
        })
    }

    return result
}

/**
 * タイムスタンプ配列から連続する記録間隔の中央値（分）を返す。
 * 2件未満の場合は null。
 */
export function calcMedianIntervalMin(timestamps: string[]): number | null {
    if (timestamps.length < 2) return null

    const sorted = [...timestamps].sort()
    const intervals: number[] = []

    for (let i = 1; i < sorted.length; i++) {
        const diff = differenceInMinutes(parseISO(sorted[i]), parseISO(sorted[i - 1]))
        if (diff > 0) intervals.push(diff)
    }

    if (intervals.length === 0) return null

    intervals.sort((a, b) => a - b)
    const mid = Math.floor(intervals.length / 2)
    return intervals.length % 2 === 0
        ? (intervals[mid - 1] + intervals[mid]) / 2
        : intervals[mid]
}
