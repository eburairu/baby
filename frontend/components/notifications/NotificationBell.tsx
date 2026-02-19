"use client"
import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/api"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationDropdown } from "./NotificationDropdown"
import type { UnreadCountResponse } from "@/types/notification"

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const { data, mutate: mutateCount } = useSWR<UnreadCountResponse>(
        "/notifications/unread-count",
        fetcher,
        { refreshInterval: 30000 }
    )

    const unreadCount = data?.count ?? 0

    // ドロップダウン外クリックで閉じる
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen])

    // Service Worker からの BroadcastChannel メッセージを受信して未読数を更新
    useEffect(() => {
        let channel: BroadcastChannel | null = null
        try {
            channel = new BroadcastChannel("notifications")
            channel.onmessage = (event) => {
                if (event.data?.type === "PUSH_RECEIVED") {
                    mutateCount()
                }
            }
        } catch {
            // BroadcastChannel 非対応ブラウザはポーリングにフォールバック
        }
        return () => channel?.close()
    }, [mutateCount])

    return (
        <div ref={containerRef} className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-500 dark:text-zinc-400"
                aria-label={`通知${unreadCount > 0 ? `（未読${unreadCount}件）` : ""}`}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white leading-none">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 z-50">
                    <NotificationDropdown
                        onCountChange={mutateCount}
                        onClose={() => setIsOpen(false)}
                    />
                </div>
            )}
        </div>
    )
}
