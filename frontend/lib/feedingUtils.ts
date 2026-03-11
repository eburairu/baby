import { BabyRecord } from "@/types/record"
import { Feeding, FeedingType, BreastSide, FeedingCreate, BottleContentType, FeedingCompletion } from "@/types/feeding"
import { formatElapsed } from "@/lib/ageUtils"
import { isToday, formatMonthDaySlash, subtractDays, isSameDay } from "@/lib/dateUtils"
import { FeedingFormValues } from "@/schemas/feeding"

export interface NormalizedFeeding {
    id: number
    timestamp: string // ISO
    type: FeedingType
    amount: number
    duration: number
    leftDuration: number
    rightDuration: number
    lastBreastSide: BreastSide | null
    bottleContentType: BottleContentType | null
}

interface FeedingDetails {
    feeding_type?: string
    amount_ml?: number
    duration_minutes?: number
    bottle_content_type?: BottleContentType | null
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
        lastBreastSide: null, // レコードAPIからは取得不可
        bottleContentType: details.bottle_content_type || null
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
        lastBreastSide: feeding.last_breast_side || null,
        bottleContentType: feeding.bottle_content_type || null
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
    lastBottleContentType: BottleContentType | null
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
        f => (f.type === 'BOTTLE' || f.type === 'MIXED') && (f.amount > 0 || f.bottleContentType)
    )
    const lastMilkAmount = lastMilkFeeding?.amount ?? null
    const lastBottleContentType = lastMilkFeeding?.bottleContentType ?? null

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
        lastBottleContentType,
        lastElapsed: lastFeeding ? formatElapsed(lastFeeding.timestamp) : null
    }
}

export interface DailyFeedingData {
    date: string    // "M/d" 表示用
    count: number
    breastMin: number
    bottleMl: number
}

export function calculateDailyStats(feedings: NormalizedFeeding[], days = 7): DailyFeedingData[] {
    const today = new Date()
    return Array.from({ length: days }, (_, i) => {
        const day = subtractDays(today, days - 1 - i)
        const dayFeedings = feedings.filter(f => isSameDay(new Date(f.timestamp), day))
        let breastMin = 0
        let bottleMl = 0
        for (const f of dayFeedings) {
            if (f.type === 'BREAST' || f.type === 'MIXED') breastMin += f.duration
            if (f.type === 'BOTTLE' || f.type === 'MIXED') bottleMl += f.amount
        }
        return {
            date: formatMonthDaySlash(day),
            count: dayFeedings.length,
            breastMin,
            bottleMl,
        }
    })
}

export interface HourlyPoint {
    hour: number   // 0-23
    today: number  // 0:00〜hour:59 の累積回数（今日）
    avg7: number   // 過去7日（当日除く）の同時刻累積回数の平均
}

export function buildFeedingHourlyComparison(feedings: NormalizedFeeding[]): HourlyPoint[] {
    const getHourJST = (iso: string) => (new Date(iso).getUTCHours() + 9) % 24

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const days = Array.from({ length: 7 }, (_, i) => {
        return new Date(todayStart.getTime() - (i + 1) * 86400000)
    })

    const todayRecs = feedings.filter(f => isSameDay(new Date(f.timestamp), todayStart))

    return Array.from({ length: 24 }, (_, hour) => {
        const todayCount = todayRecs.filter(f => getHourJST(f.timestamp) <= hour).length

        const past7Counts = days.map(dayStart => {
            const dayRecs = feedings.filter(f => isSameDay(new Date(f.timestamp), dayStart))
            return dayRecs.filter(f => getHourJST(f.timestamp) <= hour).length
        })
        const avg7 = past7Counts.reduce((s, n) => s + n, 0) / 7

        return { hour, today: todayCount, avg7 }
    })
}

interface BuildFeedingPayloadOptions {
    babyId: number
    values: FeedingFormValues
    activeTab: FeedingType
    feedingCompletion: FeedingCompletion | null
    bottleContentType: BottleContentType | null
    burped?: boolean | null
}

export function buildFeedingPayload({
    babyId,
    values,
    activeTab,
    feedingCompletion,
    bottleContentType,
    burped
}: BuildFeedingPayloadOptions): FeedingCreate {
    const leftMin = values.left_breast_minutes || 0
    const rightMin = values.right_breast_minutes || 0

    let lastBreastSide: BreastSide | undefined
    if (activeTab === "BREAST") {
        if (leftMin > 0 && rightMin > 0) lastBreastSide = "BOTH"
        else if (leftMin > 0) lastBreastSide = "LEFT"
        else if (rightMin > 0) lastBreastSide = "RIGHT"
    }

    const data: FeedingCreate = {
        baby_id: babyId,
        feeding_time: values.feeding_time,
        feeding_type: activeTab,
        notes: values.notes || "",
        feeding_completion: feedingCompletion,
        burped: burped ?? null,
    }

    if (activeTab === "BREAST") {
        data.left_breast_minutes = leftMin
        data.right_breast_minutes = rightMin
        data.last_breast_side = lastBreastSide
        data.amount_ml = null
        data.bottle_content_type = null
        if (!(leftMin > 0 && rightMin > 0)) {
            data.duration_minutes = leftMin + rightMin || 0
        }
    } else {
        data.amount_ml = values.amount_ml
        data.bottle_content_type = bottleContentType
        data.left_breast_minutes = null
        data.right_breast_minutes = null
        data.last_breast_side = null
        data.duration_minutes = null
    }

    return data
}
