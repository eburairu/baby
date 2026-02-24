import { BabyRecord } from "@/types/record"
import { Feeding, FeedingType, BreastSide } from "@/types/feeding"
import { isToday, formatElapsed } from "@/lib/ageUtils"

export interface NormalizedFeeding {
    id: number
    timestamp: string // ISO
    type: FeedingType
    amount: number
    duration: number
    leftDuration: number
    rightDuration: number
    lastBreastSide: BreastSide | null
}

interface FeedingDetails {
    feeding_type?: string
    amount_ml?: number
    duration_minutes?: number
}

export function normalizeFeedingFromRecord(record: BabyRecord): NormalizedFeeding | null {
    if (record.type !== 'feeding') return null

    const details = record.details as unknown as FeedingDetails

    // feeding_type がない場合はデフォルトで BOTTLE にするなどの安全策
    const type = (details.feeding_type as FeedingType) || 'BOTTLE'
    return {
        id: record.id,
        timestamp: record.timestamp,
        type: type,
        amount: details.amount_ml || 0,
        duration: details.duration_minutes || 0,
        leftDuration: 0, // レコードAPIからは取得不可
        rightDuration: 0, // レコードAPIからは取得不可
        lastBreastSide: null // レコードAPIからは取得不可
    }
}

export function normalizeFeedingFromEntity(feeding: Feeding): NormalizedFeeding {
    return {
        id: feeding.id,
        timestamp: feeding.feeding_time,
        type: feeding.feeding_type,
        amount: feeding.amount_ml || 0,
        duration: feeding.duration_minutes || 0,
        leftDuration: feeding.left_breast_minutes || 0,
        rightDuration: feeding.right_breast_minutes || 0,
        lastBreastSide: feeding.last_breast_side || null
    }
}

export interface FeedingStatsResult {
    todayCount: number
    todayDuration: number
    todayAmount: number
    todayLeftDuration: number
    todayRightDuration: number
    lastFeedingTime: string | null
    lastFeedingType: FeedingType | null
    lastBreastSide: BreastSide | null
    lastMilkAmount: number | null
    lastElapsed: string | null
}

export function calculateFeedingStats(feedings: NormalizedFeeding[]): FeedingStatsResult {
    const todayFeedings = feedings.filter((f) => isToday(f.timestamp))

    let todayDuration = 0
    let todayAmount = 0
    let todayLeftDuration = 0
    let todayRightDuration = 0

    for (const f of todayFeedings) {
        if (f.type === 'BREAST' || f.type === 'MIXED') {
            todayDuration += f.duration
            todayLeftDuration += f.leftDuration
            todayRightDuration += f.rightDuration
        }
        if (f.type === 'BOTTLE' || f.type === 'MIXED') {
            todayAmount += f.amount
        }
    }

    const lastFeeding = feedings[0]

    // 直近の母乳記録から最終授乳側を取得
    const lastBreastFeeding = feedings.find(
        f => f.type === 'BREAST' || f.type === 'MIXED'
    )
    const lastBreastSide = lastBreastFeeding?.lastBreastSide ?? null

    // 直近のミルク記録から前回量を取得
    const lastMilkFeeding = feedings.find(
        f => (f.type === 'BOTTLE' || f.type === 'MIXED') && f.amount > 0
    )
    const lastMilkAmount = lastMilkFeeding?.amount ?? null

    return {
        todayCount: todayFeedings.length,
        todayDuration,
        todayAmount,
        todayLeftDuration,
        todayRightDuration,
        lastFeedingTime: lastFeeding ? lastFeeding.timestamp : null,
        lastFeedingType: lastFeeding ? lastFeeding.type : null,
        lastBreastSide,
        lastMilkAmount,
        lastElapsed: lastFeeding ? formatElapsed(lastFeeding.timestamp) : null
    }
}
