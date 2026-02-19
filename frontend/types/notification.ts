export type NotificationType =
    | "family_record"
    | "comment"
    | "daily_summary"
    | "feeding_reminder"
    | "diaper_reminder"
    | "system"

export type AppNotificationResponse = {
    id: number
    type: NotificationType
    title: string
    body: string | null
    url: string | null
    is_read: boolean
    created_at: string // ISO 8601
}

export type UnreadCountResponse = {
    count: number
}
