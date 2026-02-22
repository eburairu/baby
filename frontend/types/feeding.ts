import type { components } from "@/types/generated/api"

export type FeedingType = components["schemas"]["FeedingType"]
export type BreastSide = components["schemas"]["BreastSide"]
export type BottleContentType = components["schemas"]["BottleContentType"]
export type FeedingCompletion = components["schemas"]["FeedingCompletion"]
export type Feeding = components["schemas"]["FeedingResponse"]
export type FeedingCreate = components["schemas"]["FeedingCreate"]
export type FeedingUpdate = components["schemas"]["FeedingUpdate"]

// フロントエンド固有の計算型（手動管理）
export interface FeedingSummary {
    today_count: number
    today_duration: number // minutes (母乳合計)
    today_amount: number // ml
    last_feeding_time: string | null // ISO 8601
    last_feeding_type: FeedingType | null
    // Phase 1: 左右別統計・最終授乳側
    last_breast_side: BreastSide | null
    today_left_duration: number // minutes (左乳合計)
    today_right_duration: number // minutes (右乳合計)
    last_milk_amount: number | null // ml (前回ミルク量)
}
