/** APIレスポンスの陣痛記録型 */
export interface ContractionRecord {
    id: number
    user_id: number
    baby_id: number
    start_time: string
    end_time: string | null
    duration_seconds: number | null
    interval_seconds: number | null
    notes: string | null
}

/** API POST リクエスト用 */
export interface ContractionCreate {
    baby_id: number
    start_time: string
    end_time?: string
    duration_seconds?: number
    interval_seconds?: number
    notes?: string
}

/** タイマーの状態 */
export type TimerStatus = 'idle' | 'timing'

/** 統計情報 */
export interface ContractionStatsData {
    count: number
    avgDuration: number | null
    avgInterval: number | null
    shouldAlert: boolean
}
