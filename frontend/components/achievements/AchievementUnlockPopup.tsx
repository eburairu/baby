"use client"

import { useEffect, useState } from "react"
import { achievementEvents, UnlockedAchievementInfo } from "@/lib/achievementEvents"
import { RARITY_COLOR, RARITY_LABEL } from "@/lib/achievements"
import { cn } from "@/lib/utils"

interface PopupItem {
    id: string
    achievement: UnlockedAchievementInfo
}

export function AchievementUnlockPopup() {
    const [queue, setQueue] = useState<PopupItem[]>([])

    useEffect(() => {
        return achievementEvents.subscribe((achievements) => {
            const items = achievements.map((a) => ({
                id: `${a.achievement_id}-${Date.now()}-${Math.random()}`,
                achievement: a,
            }))
            setQueue((prev) => [...prev, ...items])
        })
    }, [])

    // 先頭の1件を3秒後に自動削除
    useEffect(() => {
        if (queue.length === 0) return
        const timer = setTimeout(() => {
            setQueue((prev) => prev.slice(1))
        }, 3500)
        return () => clearTimeout(timer)
    }, [queue])

    if (queue.length === 0) return null

    const current = queue[0]

    return (
        <div
            className={cn(
                "fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm",
                "animate-in slide-in-from-bottom-4 fade-in duration-300"
            )}
            role="status"
            aria-live="polite"
            aria-label="実績解除"
        >
            <div className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800 rounded-2xl shadow-lg shadow-amber-100/50 dark:shadow-amber-900/20 px-4 py-3 flex items-center gap-3">
                <div className="text-4xl leading-none shrink-0">{current.achievement.icon}</div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-widest">実績解除！</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-zinc-100 leading-snug">{current.achievement.name}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">{current.achievement.description}</p>
                    <p className={cn("text-[10px] font-semibold mt-0.5", RARITY_COLOR[current.achievement.rarity as keyof typeof RARITY_COLOR])}>
                        {RARITY_LABEL[current.achievement.rarity as keyof typeof RARITY_LABEL]}
                    </p>
                </div>
                <button
                    onClick={() => setQueue((prev) => prev.slice(1))}
                    className="shrink-0 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 text-lg leading-none"
                    aria-label="閉じる"
                    title="閉じる"
                >
                    ×
                </button>
            </div>
            {queue.length > 1 && (
                <p className="text-center text-xs text-gray-400 dark:text-zinc-500 mt-1">
                    +{queue.length - 1}件の実績
                </p>
            )}
        </div>
    )
}
