"use client"

import { useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/api"
import { RARITY_COLOR, RARITY_LABEL, CATEGORY_LABEL } from "@/lib/achievements"
import { cn } from "@/lib/utils"
import { formatJapaneseDate } from "@/lib/dateUtils"

interface BabyAchievementResponse {
    id: number
    baby_id: number
    achievement_id: string
    achieved_at: string
    triggered_by_display_name: string | null
    name: string
    icon: string
    category: string
    rarity: string
    description: string
}

interface AchievementTabProps {
    babyId: number
}

const CATEGORY_ORDER = ["growth", "count", "funny", "family"]

export function AchievementTab({ babyId }: AchievementTabProps) {
    const { data, isLoading } = useSWR<BabyAchievementResponse[]>(
        `/achievements/?baby_id=${babyId}`,
        fetcher
    )
    const [selected, setSelected] = useState<BabyAchievementResponse | null>(null)

    if (isLoading) {
        return (
            <div className="py-8 text-center text-sm text-gray-400 dark:text-zinc-500">
                読み込み中...
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="py-10 text-center space-y-2">
                <p className="text-3xl">🏅</p>
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                    まだ実績がありません
                </p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">
                    記録を続けると実績が解除されます
                </p>
            </div>
        )
    }

    // カテゴリ別にグループ化
    const grouped = CATEGORY_ORDER.reduce<Record<string, BabyAchievementResponse[]>>(
        (acc, cat) => {
            acc[cat] = data.filter((a) => a.category === cat)
            return acc
        },
        {}
    )

    return (
        <>
            <div className="space-y-5 pb-4">
                <p className="text-xs text-center text-gray-400 dark:text-zinc-500">
                    {data.length}件の実績を解除済み
                </p>
                {CATEGORY_ORDER.map((cat) => {
                    const items = grouped[cat]
                    if (!items || items.length === 0) return null
                    return (
                        <div key={cat}>
                            <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                                {CATEGORY_LABEL[cat as keyof typeof CATEGORY_LABEL]}
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {items.map((a) => (
                                    <AchievementCard key={a.id} achievement={a} onTap={() => setSelected(a)} />
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
            {selected && (
                <AchievementDetailModal achievement={selected} onClose={() => setSelected(null)} />
            )}
        </>
    )
}

function AchievementCard({ achievement, onTap }: { achievement: BabyAchievementResponse; onTap: () => void }) {
    return (
        <button
            onClick={onTap}
            aria-label={`${achievement.name}の詳細を表示`}
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-gray-50 dark:bg-zinc-800/60 text-center w-full active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400"
        >
            <span className="text-3xl leading-none" aria-hidden="true">{achievement.icon}</span>
            <span className="text-[11px] font-semibold text-gray-800 dark:text-zinc-100 leading-tight line-clamp-2">
                {achievement.name}
            </span>
            <span className={cn("text-[10px] font-medium", RARITY_COLOR[achievement.rarity as keyof typeof RARITY_COLOR])}>
                {RARITY_LABEL[achievement.rarity as keyof typeof RARITY_LABEL]}
            </span>
            <span className="text-[9px] text-gray-400 dark:text-zinc-500">
                {formatJapaneseDate(achievement.achieved_at.split("T")[0])}
            </span>
        </button>
    )
}

function AchievementDetailModal({ achievement, onClose }: { achievement: BabyAchievementResponse; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-2xl px-6 pt-6 pb-10 space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center gap-2">
                    <span className="text-5xl leading-none">{achievement.icon}</span>
                    <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">{achievement.name}</h2>
                    <span className={cn("text-xs font-medium", RARITY_COLOR[achievement.rarity as keyof typeof RARITY_COLOR])}>
                        {RARITY_LABEL[achievement.rarity as keyof typeof RARITY_LABEL]}
                    </span>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl px-4 py-3 space-y-1">
                    <p className="text-[11px] text-gray-400 dark:text-zinc-500 font-medium">解除条件</p>
                    <p className="text-sm text-gray-700 dark:text-zinc-200">{achievement.description}</p>
                </div>
                <div className="text-xs text-gray-400 dark:text-zinc-500 text-center space-y-0.5">
                    <p>{formatJapaneseDate(achievement.achieved_at.split("T")[0])} に解除</p>
                    {achievement.triggered_by_display_name && (
                        <p>{achievement.triggered_by_display_name} の記録で達成</p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-sm font-medium text-gray-600 dark:text-zinc-300 active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400"
                >
                    閉じる
                </button>
            </div>
        </div>
    )
}
