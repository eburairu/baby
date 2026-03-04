"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Baby, MessageCircle, Sparkles, Bell, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AppNotification } from "@/hooks/useNotifications"
import { markAsRead } from "@/hooks/useNotifications"
import { Hexagon } from "@/components/ui/hexagon"

const TYPE_ICON: Record<AppNotification["type"], React.ReactNode> = {
    family_record: <Baby className="h-4 w-4 text-rose-500" />,
    comment: <MessageCircle className="h-4 w-4 text-indigo-500" />,
    daily_summary: <Sparkles className="h-4 w-4 text-amber-500" />,
    feeding_reminder: <Clock className="h-4 w-4 text-orange-500" />,
    diaper_reminder: <Clock className="h-4 w-4 text-orange-500" />,
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
    onClick?: () => void
}

export function NotificationItem({ notification, onRead, onClick }: Props) {
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(false)

    const handleClick = async () => {
        if (isProcessing) return

        setIsProcessing(true)
        // 通知を選択したら即座にドロップダウンを閉じる
        onClick?.()

        try {
            if (!notification.is_read) {
                await markAsRead(notification.id)
                onRead()
            }
            if (notification.url) {
                router.push(notification.url)
                // NOTE: router.push does not return a promise. 
                // We keep isProcessing=true to show loading until the page unmounts or navigates.
            } else {
                setIsProcessing(false)
            }
        } catch (error) {
            console.error("Failed to process notification click:", error)
            setIsProcessing(false)
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={isProcessing}
            className={cn(
                "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                "hover:bg-gray-50 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset",
                !notification.is_read && "bg-indigo-50/60 dark:bg-indigo-950/30",
                isProcessing && "opacity-70 cursor-wait"
            )}
        >
            <Hexagon
                size={32}
                className="mt-0.5 shrink-0 text-white dark:text-zinc-800"
                borderWidth={0}
                borderColor="transparent"
            >
                {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                ) : (
                    TYPE_ICON[notification.type]
                )}
            </Hexagon>
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
