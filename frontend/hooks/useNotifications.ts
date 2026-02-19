import useSWR from "swr"
import { fetcher, api } from "@/lib/api"

export type AppNotification = {
    id: number
    type: "family_record" | "comment" | "daily_summary" | "system"
    title: string
    body: string | null
    url: string | null
    is_read: boolean
    created_at: string
}

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "") + "/api"

export function useUnreadCount() {
    const { data, mutate } = useSWR<{ count: number }>(
        "/notifications/unread-count",
        fetcher,
        { refreshInterval: 30000 }
    )
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

export async function markAsRead(id: number): Promise<AppNotification> {
    return api.patch<AppNotification, Record<string, never>>(`/notifications/${id}/read`, {})
}

export async function markAllAsRead(): Promise<void> {
    await fetch(`${API_BASE}/notifications/read-all`, {
        method: "PATCH",
        credentials: "include",
    })
}
