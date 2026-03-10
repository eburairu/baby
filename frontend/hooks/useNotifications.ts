import { useEffect } from "react"
import useSWR from "swr"
import { fetcher, api } from "@/lib/api"
import { SWR_REFRESH_INTERVAL_MS } from "@/constants"

export type AppNotification = {
    id: number
    type: "family_record" | "comment" | "daily_summary" | "feeding_reminder" | "diaper_reminder" | "system" | "achievement"
    title: string
    body: string | null
    url: string | null
    is_read: boolean
    created_at: string
}


export function useUnreadCount() {
    const { data, mutate } = useSWR<{ count: number }>(
        "/notifications/unread-count",
        fetcher,
        { refreshInterval: SWR_REFRESH_INTERVAL_MS }
    )

    // Service Worker からの BroadcastChannel メッセージを受信して未読数を更新
    useEffect(() => {
        let channel: BroadcastChannel | null = null
        try {
            channel = new BroadcastChannel("notifications")
            channel.onmessage = (event) => {
                if (event.data?.type === "PUSH_RECEIVED") {
                    mutate()
                }
            }
        } catch {
            // BroadcastChannel 非対応ブラウザはポーリングにフォールバック
        }
        return () => channel?.close()
    }, [mutate])

    return { count: data?.count ?? 0, mutate }
}

export function useNotifications() {
    const { data, mutate, isLoading } = useSWR<AppNotification[]>(
        "/notifications",
        fetcher,
        { revalidateOnFocus: true }
    )
    return { notifications: data ?? [], mutate, isLoading }
}

export async function markAsRead(id: number): Promise<void> {
    await api.patch<void, Record<string, never>>(`/notifications/${id}/read`, {})
}

export async function markAllAsRead(): Promise<void> {
    await api.patch<void, Record<string, never>>(`/notifications/read-all`, {})
}
