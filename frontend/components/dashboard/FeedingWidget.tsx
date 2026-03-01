"use client"

import { useMemo, memo } from "react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { HexagonWidgetCard } from "./HexagonWidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { normalizeFeedingFromRecord, calculateFeedingStats, NormalizedFeeding } from "@/lib/feedingUtils"
import { calcProgress, isOverThreshold } from "@/lib/indicatorUtils"
import { AppIcons } from "@/constants/icons"
import Link from "next/link"
import { useTick } from "@/hooks/useTick"

export const FeedingWidget = memo(function FeedingWidget({ babyId, records, isError, isLoading, size, thresholdMinutes }: BaseWidgetProps) {
    const tick = useTick()

    const { todayCount, lastElapsed, lastFeedingTime } = useMemo(() => {
        // tick に依存させることで1分ごとの更新を保証する
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        tick;
        const feedingRecords = records
            ?.map(normalizeFeedingFromRecord)
            .filter((f): f is NormalizedFeeding => f !== null) ?? []
        return calculateFeedingStats(feedingRecords)
    }, [records, tick])

    // tick は再レンダリングを促すために state として持つが、計算自体には含める必要がない
    // (再レンダリング時に calcProgress が新しい時刻で再計算されるため)
    const progress = thresholdMinutes != null
        ? calcProgress(lastFeedingTime, thresholdMinutes)
        : 0
    const isOver = isOverThreshold(progress)

    return (
        <Link href={`/feeding?baby_id=${babyId}`} className="block">
            <HexagonWidgetCard
                title="授乳"
                icon={<AppIcons.feeding className="w-5 h-5 text-rose-500" />}
                isError={isError}
                isLoading={isLoading}
                size={size}
                className="hover:shadow-rose-100 dark:hover:shadow-rose-900/20"
                indicatorProgress={thresholdMinutes != null ? progress : undefined}
                isOverThreshold={isOver}
            >
                <div className="flex flex-col items-center">
                    <span className="font-bold text-gray-800 dark:text-zinc-200">{lastElapsed}</span>
                    <span className="text-[10px] text-gray-500 dark:text-zinc-500 mt-0.5">今日 {todayCount}回</span>
                </div>
            </HexagonWidgetCard>
        </Link>
    )
}, createWidgetMemoComparison('feeding'))
