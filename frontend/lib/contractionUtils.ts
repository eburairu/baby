import type { ContractionRecord } from "@/types/contraction"

/**
 * 陣痛間隔（秒）を計算する。
 *
 * 定義: 前回の start_time → 今回の startTime（start-to-start 間隔）
 * 理由: 5-1-1ルール「5分おき」= start-to-start 5分が医学的標準定義。
 *
 * 以下の場合は undefined を返す（記録しない）:
 * - 前回記録がない
 * - 計算結果が 0 以下（時計ズレ等の異常値）
 * - 計算結果が maxIntervalSeconds 以上（新セッション扱い）
 */
export function calculateIntervalSeconds(
    lastContraction: ContractionRecord | null | undefined,
    currentStartTime: Date,
    maxIntervalSeconds = 3600, // 1時間超は新セッションとして扱い記録しない
): number | undefined {
    if (!lastContraction) return undefined

    const previousStartTime = new Date(lastContraction.start_time)
    const diff = Math.round(
        (currentStartTime.getTime() - previousStartTime.getTime()) / 1000
    )

    if (diff <= 0 || diff >= maxIntervalSeconds) return undefined
    return diff
}

/**
 * 5-1-1ルール判定。
 *
 * qualifying = interval_seconds ≤ 300 AND duration_seconds ≥ 60 の陣痛。
 * 以下の全条件を満たすとき true:
 *   1. qualifying が 3件以上
 *   2. 最古の qualifying の start_time が 1時間以上前（パターン継続）
 *   3. 最新の qualifying の start_time が 30分以内（まだ続いている）
 *
 * 注意: contractions は API の降順（新しい順）を想定。
 *       qualifying[0] が最新、qualifying[last] が最古。
 */
export function calculateShouldAlert(contractions: ContractionRecord[]): boolean {
    const qualifying = contractions.filter(
        (c) =>
            c.interval_seconds != null &&
            c.duration_seconds != null &&
            c.interval_seconds <= 300 &&
            c.duration_seconds >= 60,
    )

    if (qualifying.length < 3) return false

    const now = Date.now()
    const newestTime = new Date(qualifying[0].start_time).getTime()
    const oldestTime = new Date(qualifying[qualifying.length - 1].start_time).getTime()

    return (
        oldestTime <= now - 3_600_000 && // 最古が1時間以上前
        newestTime >= now - 1_800_000    // 最新が30分以内
    )
}

/**
 * グラフ用データを準備する。
 *
 * APIの降順データを時系列順（古い→新しい）に並べ替え、直近10件を返す。
 */
export function prepareGraphData(contractions: ContractionRecord[]): ContractionRecord[] {
    // 降順なので reverse して時系列順にし、末尾10件（最新10件）を取る
    return [...contractions].reverse().slice(-10)
}

// ──────────────────────────────────────────
// 統計計算 (calculateStats)
// ──────────────────────────────────────────
export interface ContractionStatsResult {
    count: number
    avgDuration: number | null
    avgInterval: number | null
    shouldAlert: boolean
}

/**
 * 統計情報を計算する。
 *
 * - count: 直近1時間（oneHourAgo 以降）の回数
 * - avgDuration: 最新10件の平均持続時間
 * - avgInterval: 最新10件の平均間隔
 * - shouldAlert: 5-1-1ルール判定
 */
export function calculateStats(
    contractions: ContractionRecord[],
    now = Date.now()
): ContractionStatsResult {
    const oneHourAgo = now - 60 * 60 * 1000

    // 直近1時間の回数（仕様 F3）
    const recentCount = contractions.filter(
        (c) => new Date(c.start_time).getTime() >= oneHourAgo && c.duration_seconds != null
    ).length

    // 平均値は「直近の傾向」を示すため、時間の制限ではなく件数（最新10件）で計算する
    // これにより、1時間以上前の記録でも平均が表示され、「-」のままになるのを防ぐ
    const validRecords = contractions
        .filter((c) => c.duration_seconds != null) // 完了したもののみ
        .slice(0, 10)

    // 有効な記録がない場合
    if (validRecords.length === 0) {
        return { count: recentCount, avgDuration: null, avgInterval: null, shouldAlert: false }
    }

    const durations = validRecords
        .map((c) => c.duration_seconds)
        .filter((d): d is number => d != null)

    const intervals = validRecords
        .map((c) => c.interval_seconds)
        .filter((i): i is number => i != null)

    const avgDuration = durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : null

    const avgInterval = intervals.length > 0
        ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
        : null

    const shouldAlert = calculateShouldAlert(contractions)

    return { count: recentCount, avgDuration, avgInterval, shouldAlert }
}
