import type { components } from "@/types/generated/api"

export type ContractionRecord = components["schemas"]["ContractionResponse"]
export type ContractionCreate = components["schemas"]["ContractionCreate"]

// フロントエンド固有の型（手動管理）
export type TimerStatus = 'idle' | 'timing'

export interface ContractionStatsData {
    count: number
    avgDuration: number | null
    avgInterval: number | null
    shouldAlert: boolean
}
