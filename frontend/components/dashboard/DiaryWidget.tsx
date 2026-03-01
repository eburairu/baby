"use client"

import { memo } from "react"
import { AppIcons } from "@/constants/icons"
import { useDailySummaries } from "@/hooks/useDailySummary"
import { HexagonWidgetCard } from "./HexagonWidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import Link from "next/link"

export const DiaryWidget = memo(function DiaryWidget({ babyId, size }: BaseWidgetProps) {
    const { summaries, isLoading, error } = useDailySummaries(parseInt(babyId, 10))

    const latestSummary = summaries?.[0]
    
    // 日付ラベル
    const dateLabel = latestSummary 
        ? `${new Date(latestSummary.summary_date + "T00:00:00").getMonth() + 1}/${new Date(latestSummary.summary_date + "T00:00:00").getDate()}`
        : null

    return (
        <Link href={`/diary?baby_id=${babyId}`} className="block">
            <HexagonWidgetCard
                title="育児日誌"
                icon={<AppIcons.diary className="w-5 h-5 text-purple-500" />}
                isError={error}
                isLoading={isLoading} 
                size={size}
                className="hover:shadow-purple-100 dark:hover:shadow-purple-900/20"
            >
                <div className="flex flex-col items-center">
                    {latestSummary ? (
                        <>
                            <span className="font-bold text-gray-800 dark:text-zinc-200 line-clamp-1 w-full px-1">
                                {latestSummary.display_content}
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-zinc-500 mt-0.5">{dateLabel}のまとめ</span>
                        </>
                    ) : (
                        <span className="text-[10px] text-gray-500 dark:text-zinc-600">日誌なし</span>
                    )}
                </div>
            </HexagonWidgetCard>
        </Link>
    )
})
