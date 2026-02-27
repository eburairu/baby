"use client"

import { useMemo, memo } from "react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { WidgetCard } from "./WidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { WidgetContent } from "./WidgetContent"
import { normalizeFeedingFromRecord, calculateFeedingStats, NormalizedFeeding } from "@/lib/feedingUtils"
import { Milk } from "lucide-react"

export const FeedingWidget = memo(function FeedingWidget({ babyId, records, isError, isLoading }: BaseWidgetProps) {
    const { todayCount, lastElapsed } = useMemo(() => {
        const feedingRecords = records
            ?.map(normalizeFeedingFromRecord)
            .filter((f): f is NormalizedFeeding => f !== null) ?? []
        return calculateFeedingStats(feedingRecords)
    }, [records])

    return (
        <WidgetCard
            title={<span className="text-rose-500 dark:text-rose-400 flex items-center gap-1"><Milk className="w-4 h-4" /> 授乳</span>}
            href={`/feeding?baby_id=${babyId}`}
            isError={isError}
            actionHoverColor="hover:text-rose-500 dark:hover:text-rose-400"
            ariaLabel="授乳の詳細を見る"
        >
            <WidgetContent
                isLoading={isLoading}
                loadingColorClass="text-rose-400"
                elapsed={lastElapsed}
                subContent={`今日: ${todayCount}回`}
            />
        </WidgetCard>
    )
}, createWidgetMemoComparison('feeding'))
