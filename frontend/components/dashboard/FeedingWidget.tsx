"use client"
import { RECORD_TYPES } from '@/types/enums';

import { useMemo, memo } from "react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { useQuickRecord } from "@/hooks/useQuickRecord"
import { api } from "@/lib/api"
import { WidgetCard } from "./WidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { WidgetContent } from "./WidgetContent"
import { WidgetQuickButton } from "./WidgetQuickButton"
import { normalizeFeedingFromRecord, calculateFeedingStats, NormalizedFeeding } from "@/lib/feedingUtils"
import { Milk, Waves } from "lucide-react"

export const FeedingWidget = memo(function FeedingWidget({ babyId, records, isError, mutate, isLoading }: BaseWidgetProps) {
    const { canWrite, loading, executeRecord } = useQuickRecord(babyId, { onSuccess: mutate })

    const { todayCount, lastElapsed } = useMemo(() => {
        const feedingRecords = records
            ?.map(normalizeFeedingFromRecord)
            .filter((f): f is NormalizedFeeding => f !== null) ?? []
        return calculateFeedingStats(feedingRecords)
    }, [records])

    const handleQuickRecord = async (feedingType: string) => {
        const typeLabel = feedingType === "bottle" ? "ミルク" : "母乳"

        await executeRecord(async () => {
            return api.post<{ id: number }>("/feedings/", {
                baby_id: Number(babyId),
                feeding_type: feedingType.toUpperCase(),
                feeding_time: new Date().toISOString(),
            })
        }, {
            label: typeLabel,
            feedbackType: RECORD_TYPES.FEEDING
        })
    }

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
            {canWrite ? (
                <div className="flex gap-2 justify-center">
                    <WidgetQuickButton
                        color="rose"
                        loading={loading}
                        disabled={loading}
                        onClick={() => handleQuickRecord("bottle")}
                        size={48}
                        title="ミルクを記録"
                        aria-label="ミルクを記録"
                    >
                        <Milk className="w-5 h-5" />
                    </WidgetQuickButton>
                    <WidgetQuickButton
                        color="rose"
                        loading={loading}
                        disabled={loading}
                        onClick={() => handleQuickRecord("breast")}
                        size={48}
                        title="母乳を記録"
                        aria-label="母乳を記録"
                    >
                        <Waves className="w-5 h-5" />
                    </WidgetQuickButton>
                </div>
            ) : null}
        </WidgetCard>
    )
}, createWidgetMemoComparison('feeding'))
