"use client"
import { useState, useRef, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUnreadCount, useNotifications, markAllAsRead } from "@/hooks/useNotifications"
import { NotificationItem } from "./NotificationItem"

export function NotificationBell() {
    const [open, setOpen] = useState(false)
    const { count, mutate: mutateCount } = useUnreadCount()
    const { notifications, mutate: mutateList, isLoading } = useNotifications()
    const panelRef = useRef<HTMLDivElement>(null)

    // パネル外クリックで閉じる
    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [open])

    const handleOpen = () => {
        setOpen((prev) => !prev)
        if (!open) {
            mutateList()
        }
    }

    const handleRead = () => {
        mutateList()
        mutateCount()
    }

    const handleReadAll = async () => {
        await markAllAsRead()
        mutateList()
        mutateCount()
    }

    const displayCount = count > 99 ? "99+" : count > 0 ? String(count) : null

    return (
        <div className="relative" ref={panelRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleOpen}
                aria-label="通知"
                className="relative text-gray-500 dark:text-zinc-400"
            >
                <Bell className="h-5 w-5" />
                {displayCount && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white leading-none">
                        {displayCount}
                    </span>
                )}
            </Button>

            {open && (
                <div className={cn(
                    "absolute right-0 top-10 z-[100] w-80 rounded-xl border border-gray-100 dark:border-zinc-800",
                    "bg-white dark:bg-zinc-900 shadow-lg overflow-hidden"
                )}>
                    {/* ヘッダー */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-zinc-800">
                        <span className="text-sm font-semibold text-gray-800 dark:text-zinc-100">通知</span>
                        {count > 0 && (
                            <button
                                onClick={handleReadAll}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                すべて既読にする
                            </button>
                        )}
                    </div>

                    {/* 通知リスト */}
                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-50 dark:divide-zinc-800">
                        {isLoading ? (
                            <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-zinc-500">
                                読み込み中...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-zinc-500">
                                通知はありません
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <NotificationItem
                                    key={n.id}
                                    notification={n}
                                    onRead={handleRead}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
