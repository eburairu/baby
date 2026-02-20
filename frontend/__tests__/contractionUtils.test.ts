import { describe, it, expect } from "vitest"
import {
    calculateIntervalSeconds,
    calculateShouldAlert,
    prepareGraphData,
} from "@/lib/contractionUtils"
import type { ContractionRecord } from "@/types/contraction"

// ──────────────────────────────────────────
// テストデータヘルパー
// ──────────────────────────────────────────
function makeRecord(
    overrides: Partial<ContractionRecord> & { id: number; start_time: string }
): ContractionRecord {
    return {
        user_id: 1,
        baby_id: 1,
        end_time: null,
        duration_seconds: null,
        interval_seconds: null,
        notes: null,
        comment_count: 0,
        ...overrides,
    }
}

// 現在時刻の X 秒前の ISO 文字列
function secsAgo(seconds: number): string {
    return new Date(Date.now() - seconds * 1000).toISOString()
}

// ──────────────────────────────────────────
// calculateIntervalSeconds
// ──────────────────────────────────────────
describe("calculateIntervalSeconds", () => {
    it("前回記録がない場合は undefined を返す", () => {
        const now = new Date()
        expect(calculateIntervalSeconds(null, now)).toBeUndefined()
        expect(calculateIntervalSeconds(undefined, now)).toBeUndefined()
    })

    it("前回の start_time から今回の startTime までの差分（秒）を返す", () => {
        // 前回: 5分前に開始
        const prev = makeRecord({ id: 1, start_time: secsAgo(300) })
        const now = new Date()
        const result = calculateIntervalSeconds(prev, now)
        // 丸め誤差を考慮して ±2 秒の範囲で検証
        expect(result).toBeGreaterThanOrEqual(298)
        expect(result).toBeLessThanOrEqual(302)
    })

    it("間隔が閾値（3600秒=1時間）を超える場合は undefined を返す（新セッション扱い）", () => {
        const prev = makeRecord({ id: 1, start_time: secsAgo(3601) })
        const now = new Date()
        expect(calculateIntervalSeconds(prev, now)).toBeUndefined()
    })

    it("ちょうど閾値（3600秒）は undefined を返す", () => {
        const prev = makeRecord({ id: 1, start_time: secsAgo(3600) })
        const now = new Date()
        expect(calculateIntervalSeconds(prev, now)).toBeUndefined()
    })

    it("閾値未満（3599秒）は値を返す", () => {
        const prev = makeRecord({ id: 1, start_time: secsAgo(3599) })
        const now = new Date()
        const result = calculateIntervalSeconds(prev, now)
        expect(result).toBeDefined()
        expect(result).toBeGreaterThan(0)
    })

    it("差分が 0 以下（時計のズレ等）の場合は undefined を返す", () => {
        // 今回の startTime より未来に前回の start_time がある（異常ケース）
        const futureStart = new Date(Date.now() + 60_000).toISOString()
        const prev = makeRecord({ id: 1, start_time: futureStart })
        const now = new Date()
        expect(calculateIntervalSeconds(prev, now)).toBeUndefined()
    })

    it("カスタム閾値を渡せる", () => {
        // デフォルト(3600)では通らないが、7200秒の閾値なら通る
        const prev = makeRecord({ id: 1, start_time: secsAgo(4000) })
        const now = new Date()
        expect(calculateIntervalSeconds(prev, now, 3600)).toBeUndefined()
        expect(calculateIntervalSeconds(prev, now, 7200)).toBeDefined()
    })
})

// ──────────────────────────────────────────
// calculateShouldAlert（5-1-1ルール）
// ──────────────────────────────────────────
describe("calculateShouldAlert", () => {
    // qualifying = interval ≤ 300 AND duration ≥ 60 の陣痛
    // APIは降順（新しい順）なので [0] が最新

    it("qualifying が 3件未満の場合は false", () => {
        // 2件しかない
        const contractions: ContractionRecord[] = [
            makeRecord({ id: 2, start_time: secsAgo(300), interval_seconds: 280, duration_seconds: 65 }),
            makeRecord({ id: 1, start_time: secsAgo(4200), interval_seconds: 290, duration_seconds: 70 }),
        ]
        expect(calculateShouldAlert(contractions)).toBe(false)
    })

    it("qualifying が 3件以上でも最新が 30分超の場合は false（陣痛が収まっている）", () => {
        // 最新のqualifyingが35分前（収まっている）
        const contractions: ContractionRecord[] = [
            makeRecord({ id: 3, start_time: secsAgo(2100), interval_seconds: 270, duration_seconds: 65 }),
            makeRecord({ id: 2, start_time: secsAgo(4800), interval_seconds: 280, duration_seconds: 70 }),
            makeRecord({ id: 1, start_time: secsAgo(7500), interval_seconds: 290, duration_seconds: 60 }),
        ]
        expect(calculateShouldAlert(contractions)).toBe(false)
    })

    it("qualifying が 3件以上でも最古が 1時間未満の場合は false（始まったばかり）", () => {
        // 3件あるが最古が50分前（1時間未満）
        const contractions: ContractionRecord[] = [
            makeRecord({ id: 3, start_time: secsAgo(600), interval_seconds: 270, duration_seconds: 65 }),
            makeRecord({ id: 2, start_time: secsAgo(1800), interval_seconds: 280, duration_seconds: 70 }),
            makeRecord({ id: 1, start_time: secsAgo(2900), interval_seconds: 290, duration_seconds: 60 }),
        ]
        expect(calculateShouldAlert(contractions)).toBe(false)
    })

    it("全条件を満たす場合は true（5-1-1ルール発動）", () => {
        // 最新: 10分前、最古: 70分前、3件以上
        const contractions: ContractionRecord[] = [
            makeRecord({ id: 4, start_time: secsAgo(600), interval_seconds: 280, duration_seconds: 65 }),
            makeRecord({ id: 3, start_time: secsAgo(2400), interval_seconds: 290, duration_seconds: 70 }),
            makeRecord({ id: 2, start_time: secsAgo(3900), interval_seconds: 270, duration_seconds: 60 }),
            makeRecord({ id: 1, start_time: secsAgo(4200), interval_seconds: 295, duration_seconds: 75 }),
        ]
        expect(calculateShouldAlert(contractions)).toBe(true)
    })

    it("interval_seconds が null のものは qualifying に含まれない", () => {
        const contractions: ContractionRecord[] = [
            makeRecord({ id: 4, start_time: secsAgo(600), interval_seconds: null, duration_seconds: 65 }),
            makeRecord({ id: 3, start_time: secsAgo(2400), interval_seconds: 290, duration_seconds: 70 }),
            makeRecord({ id: 2, start_time: secsAgo(3900), interval_seconds: 270, duration_seconds: 60 }),
            makeRecord({ id: 1, start_time: secsAgo(4200), interval_seconds: 295, duration_seconds: 75 }),
        ]
        // qualifying は id=3,2,1 の3件。最新qualifying=id3（40分前）は30分超 → false
        expect(calculateShouldAlert(contractions)).toBe(false)
    })

    it("interval_seconds > 300（6分以上）のものは qualifying に含まれない", () => {
        const contractions: ContractionRecord[] = [
            makeRecord({ id: 4, start_time: secsAgo(600), interval_seconds: 301, duration_seconds: 65 }),
            makeRecord({ id: 3, start_time: secsAgo(2400), interval_seconds: 290, duration_seconds: 70 }),
            makeRecord({ id: 2, start_time: secsAgo(3900), interval_seconds: 270, duration_seconds: 60 }),
            makeRecord({ id: 1, start_time: secsAgo(4200), interval_seconds: 295, duration_seconds: 75 }),
        ]
        // qualifying は id=3,2,1 の3件。最新qualifying=id3（40分前）は30分超 → false
        expect(calculateShouldAlert(contractions)).toBe(false)
    })

    it("duration_seconds < 60（1分未満）のものは qualifying に含まれない", () => {
        const contractions: ContractionRecord[] = [
            makeRecord({ id: 4, start_time: secsAgo(600), interval_seconds: 280, duration_seconds: 59 }),
            makeRecord({ id: 3, start_time: secsAgo(2400), interval_seconds: 290, duration_seconds: 70 }),
            makeRecord({ id: 2, start_time: secsAgo(3900), interval_seconds: 270, duration_seconds: 60 }),
            makeRecord({ id: 1, start_time: secsAgo(4200), interval_seconds: 295, duration_seconds: 75 }),
        ]
        // qualifying は id=3,2,1 の3件。最新qualifying=id3（40分前）は30分超 → false
        expect(calculateShouldAlert(contractions)).toBe(false)
    })

    it("空配列は false", () => {
        expect(calculateShouldAlert([])).toBe(false)
    })
})

// ──────────────────────────────────────────
// prepareGraphData
// ──────────────────────────────────────────
describe("prepareGraphData", () => {
    it("APIの降順（新しい順）データを時系列順（古い順）に並べ替える", () => {
        const contractions: ContractionRecord[] = [
            makeRecord({ id: 3, start_time: secsAgo(100) }),
            makeRecord({ id: 2, start_time: secsAgo(200) }),
            makeRecord({ id: 1, start_time: secsAgo(300) }),
        ]
        const result = prepareGraphData(contractions)
        expect(result[0].id).toBe(1) // 最古が先頭
        expect(result[2].id).toBe(3) // 最新が末尾
    })

    it("11件以上ある場合は直近10件のみ返す", () => {
        const contractions: ContractionRecord[] = Array.from({ length: 11 }, (_, i) =>
            makeRecord({ id: 11 - i, start_time: secsAgo((11 - i) * 300) })
        )
        // APIは降順なので id: 11, 10, 9, ..., 1 の順
        const result = prepareGraphData(contractions)
        expect(result).toHaveLength(10)
        // 直近10件 = id 11〜2（id 1 は除外）
        expect(result[0].id).toBe(2)
        expect(result[9].id).toBe(11)
    })

    it("2件以下の場合はそのまま返す（2件）", () => {
        const contractions: ContractionRecord[] = [
            makeRecord({ id: 2, start_time: secsAgo(100) }),
            makeRecord({ id: 1, start_time: secsAgo(200) }),
        ]
        const result = prepareGraphData(contractions)
        expect(result).toHaveLength(2)
    })

    it("空配列は空配列を返す", () => {
        expect(prepareGraphData([])).toEqual([])
    })
})

// ──────────────────────────────────────────
// calculateStats
// ──────────────────────────────────────────
import { calculateStats } from "@/lib/contractionUtils"

describe("calculateStats", () => {
    it("直近1時間以内の記録数をカウントする", () => {
        const contractions: ContractionRecord[] = [
            makeRecord({ id: 3, start_time: secsAgo(100), duration_seconds: 60 }), // 1分前
            makeRecord({ id: 2, start_time: secsAgo(3000), duration_seconds: 60 }), // 50分前
            makeRecord({ id: 1, start_time: secsAgo(4000), duration_seconds: 60 }), // 66分前（対象外）
        ]
        const result = calculateStats(contractions)
        expect(result.count).toBe(2)
    })

    it("duration_seconds が null の記録はカウントしない", () => {
        const contractions: ContractionRecord[] = [
            makeRecord({ id: 2, start_time: secsAgo(100), duration_seconds: null }), // 計測中など
            makeRecord({ id: 1, start_time: secsAgo(200), duration_seconds: 60 }),
        ]
        const result = calculateStats(contractions)
        expect(result.count).toBe(1)
    })

    it("平均持続・間隔は1時間以上前の記録も含めて計算する（直近10件）", () => {
        // 全て1時間以上前
        const contractions: ContractionRecord[] = [
            makeRecord({ id: 2, start_time: secsAgo(4000), duration_seconds: 60, interval_seconds: 300 }),
            makeRecord({ id: 1, start_time: secsAgo(4300), duration_seconds: 40, interval_seconds: 320 }),
        ]
        const result = calculateStats(contractions)

        // 平均持続: (60+40)/2 = 50
        expect(result.avgDuration).toBe(50)
        // 平均間隔: (300+320)/2 = 310
        expect(result.avgInterval).toBe(310)

        // カウントは0（1時間以内ではないため）
        expect(result.count).toBe(0)
    })

    it("直近10件のみで平均を計算する", () => {
        // 11件作成（全て有効）
        const contractions: ContractionRecord[] = Array.from({ length: 11 }, (_, i) =>
            makeRecord({
                id: 11 - i,
                start_time: secsAgo(100 + i * 100),
                duration_seconds: 100, // 平均100になるはず
                interval_seconds: 200
            })
        )
        // 11件目に異常値を入れる（API降順なので末尾が最古）
        // id:1 (最古) にduration=1000を入れる
        contractions[10].duration_seconds = 1000
        contractions[10].interval_seconds = 2000

        const result = calculateStats(contractions)

        // 最新10件（id 11〜2）はすべて duration=100, interval=200
        // id 1 (1000, 2000) は除外されるはず
        expect(result.avgDuration).toBe(100)
        expect(result.avgInterval).toBe(200)
    })

    it("有効なデータがない場合は null を返す", () => {
        const contractions: ContractionRecord[] = [
            makeRecord({ id: 1, start_time: secsAgo(100), duration_seconds: null }),
        ]
        const result = calculateStats(contractions)
        expect(result.avgDuration).toBeNull()
        expect(result.avgInterval).toBeNull()
        expect(result.count).toBe(0)
    })
})
