"use client"
import useSWR from "swr"
import { fetcher, api } from "@/lib/api"
import { NotificationItem } from "./NotificationItem"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import type { AppNotificationResponse } from "@/types/notification"
import { useRouter } from "next/navigation"

type Props = {
    onCountChange?: () => void
    onClose: () => void
}

export function NotificationDropdown({ onCountChange, onClose }: Props) {
    const router = useRouter()
    const {
        data: notifications,
        isLoading,
        mutate,
    } = useSWR<AppNotificationResponse[]>("/notifications", fetcher, {
        revalidateOnFocus: true,
    })

    async function handleRead(id: number, url: string | null) {
        onClose()
        try {
            await fetch(`${(process.env.NEXT_PUBLIC_API_BASE_URL ?? "") + "/api"}/notifications/${id}/read`, {
                method: "PATCH",
                credentials: "include",
            })
            await mutate()
            onCountChange?.()
        } catch {
            // 既読失敗は無視
        }
        if (url) {
            router.push(url)
        }
    }

    async function handleReadAll() {
        try {
            await fetch(`${(process.env.NEXT_PUBLIC_API_BASE_URL ?? "") + "/api"}/notifications/read-all`, {
                method: "PATCH",
                credentials: "include",
            })
            await mutate()
            onCountChange?.()
        } catch {
            // 一括既読失敗は無視
        }
    }

    return (
        <div className="w-80 max-h-[480px] flex flex-col rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
                <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">通知</span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100"
                    onClick={handleReadAll}
                >
                    すべて既読にする
                </Button>
            </div>

            {/* 通知リスト */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800">
                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                    </div>
                ) : !notifications || notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400 dark:text-zinc-500">
                        <Bell className="h-8 w-8 opacity-30" />
                        <p className="text-sm">通知はありません</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <NotificationItem key={n.id} notification={n} onRead={handleRead} />
                    ))
                )}
            </div>
        </div>
    )
}
