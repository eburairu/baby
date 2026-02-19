"use client"
import { Baby, Bell, Clock, MessageCircle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AppNotificationResponse } from "@/types/notification"

type Props = {
    notification: AppNotificationResponse
    onRead: (id: number, url: string | null) => void
}

function getIcon(type: AppNotificationResponse["type"]) {
    switch (type) {
        case "family_record":
            return <Baby className="h-4 w-4 text-blue-500" />
        case "comment":
            return <MessageCircle className="h-4 w-4 text-green-500" />
        case "daily_summary":
            return <Sparkles className="h-4 w-4 text-purple-500" />
        case "feeding_reminder":
        case "diaper_reminder":
            return <Clock className="h-4 w-4 text-orange-500" />
        case "system":
            return <Bell className="h-4 w-4 text-gray-500" />
    }
}

function formatRelativeTime(dateStr: string): string {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)

    if (diffMin < 1) return "たった今"
    if (diffMin < 60) return `${diffMin}分前`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour}時間前`
    const diffDay = Math.floor(diffHour / 24)
    if (diffDay === 1) return "昨日"
    return `${diffDay}日前`
}

export function NotificationItem({ notification, onRead }: Props) {
    return (
        <button
            onClick={() => onRead(notification.id, notification.url)}
            className={cn(
                "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800",
                !notification.is_read && "bg-blue-50/50 dark:bg-blue-950/20"
            )}
        >
            {/* 未読インジケーター */}
            <div className="mt-1.5 flex-shrink-0">
                {!notification.is_read ? (
                    <span className="block h-2 w-2 rounded-full bg-blue-500" />
                ) : (
                    <span className="block h-2 w-2" />
                )}
            </div>

            {/* アイコン */}
            <div className="mt-0.5 flex-shrink-0">
                {getIcon(notification.type)}
            </div>

            {/* テキスト */}
            <div className="min-w-0 flex-1">
                <p className={cn(
                    "text-sm leading-snug text-gray-900 dark:text-zinc-100",
                    !notification.is_read && "font-semibold"
                )}>
                    {notification.title}
                </p>
                {notification.body && (
                    <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-zinc-400">
                        {notification.body}
                    </p>
                )}
                <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">
                    {formatRelativeTime(notification.created_at)}
                </p>
            </div>
        </button>
    )
}
