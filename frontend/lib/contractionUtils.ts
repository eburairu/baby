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
