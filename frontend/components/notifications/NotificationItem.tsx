"use client"
import { useRouter } from "next/navigation"
import { Baby, MessageCircle, Sparkles, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AppNotification } from "@/hooks/useNotifications"
import { markAsRead } from "@/hooks/useNotifications"

const TYPE_ICON: Record<AppNotification["type"], React.ReactNode> = {
    family_record: <Baby className="h-4 w-4 text-rose-500" />,
    comment: <MessageCircle className="h-4 w-4 text-indigo-500" />,
    daily_summary: <Sparkles className="h-4 w-4 text-amber-500" />,
    system: <Bell className="h-4 w-4 text-gray-400" />,
}

function formatRelativeTime(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "たった今"
    if (minutes < 60) return `${minutes}分前`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}時間前`
    const days = Math.floor(hours / 24)
    if (days === 1) return "昨日"
    return `${days}日前`
}

type Props = {
    notification: AppNotification
    onRead: () => void
}

export function NotificationItem({ notification, onRead }: Props) {
    const router = useRouter()

    const handleClick = async () => {
        if (!notification.is_read) {
            await markAsRead(notification.id)
            onRead()
        }
        if (notification.url) {
            router.push(notification.url)
        }
    }

    return (
        <button
            onClick={handleClick}
            className={cn(
                "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                "hover:bg-gray-50 dark:hover:bg-zinc-800",
                !notification.is_read && "bg-indigo-50/60 dark:bg-indigo-950/30"
            )}
        >
            <div className="mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-sm">
                {TYPE_ICON[notification.type]}
            </div>
            <div className="flex-1 min-w-0">
                <p className={cn(
                    "text-sm text-gray-800 dark:text-zinc-100 leading-snug",
                    !notification.is_read && "font-semibold"
                )}>
                    {notification.title}
                </p>
                {notification.body && (
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 truncate">
                        {notification.body}
                    </p>
                )}
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                    {formatRelativeTime(notification.created_at)}
                </p>
            </div>
            {!notification.is_read && (
                <span className="mt-2 shrink-0 h-2 w-2 rounded-full bg-indigo-500" aria-label="未読" />
            )}
        </button>
    )
}
