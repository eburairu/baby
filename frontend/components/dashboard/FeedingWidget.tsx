"use client"

import { useMemo, memo } from "react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { HexagonWidgetCard } from "./HexagonWidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { normalizeFeedingFromRecord, calculateFeedingStats, NormalizedFeeding } from "@/lib/feedingUtils"
import { Milk } from "lucide-react"
import Link from "next/link"

export const FeedingWidget = memo(function FeedingWidget({ babyId, records, isError, isLoading }: BaseWidgetProps) {
    const { todayCount, lastElapsed } = useMemo(() => {
        const feedingRecords = records
            ?.map(normalizeFeedingFromRecord)
            .filter((f): f is NormalizedFeeding => f !== null) ?? []
        return calculateFeedingStats(feedingRecords)
    }, [records])

    return (
        <Link href={`/feeding?baby_id=${babyId}`} className="block">
            <HexagonWidgetCard
                title="授乳"
                icon={<Milk className="w-5 h-5 text-rose-500" />}
                isError={!!isError}
                isLoading={isLoading}
                className="hover:shadow-rose-100 dark:hover:shadow-rose-900/20"
            >
                <div className="flex flex-col items-center">
                    <span className="font-bold text-gray-800 dark:text-zinc-200">{lastElapsed}</span>
                    <span className="text-[10px] text-gray-500 dark:text-zinc-500 mt-0.5">今日 {todayCount}回</span>
                </div>
            </HexagonWidgetCard>
        </Link>
    )
}, createWidgetMemoComparison('feeding'))
