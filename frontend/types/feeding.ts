import type { components } from "@/types/generated/api"

export type FeedingType = components["schemas"]["FeedingType"]
export type Feeding = components["schemas"]["FeedingResponse"]
export type FeedingCreate = components["schemas"]["FeedingCreate"]

// フロントエンド固有の計算型（手動管理）
export interface FeedingSummary {
    today_count: number
    today_duration: number // minutes
    today_amount: number // ml
    last_feeding_time: string | null // ISO 8601
    last_feeding_type: FeedingType | null
}
