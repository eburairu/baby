"use client"

import { useMemo, memo } from "react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { HexagonWidgetCard } from "./HexagonWidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { normalizeFeedingFromRecord, calculateFeedingStats, NormalizedFeeding } from "@/lib/feedingUtils"
import { Milk } from "lucide-react"
import { useQuickRecord } from "@/hooks/useQuickRecord"
import { api } from "@/lib/api"
import { RECORD_TYPES } from "@/types/enums"

export const FeedingWidget = memo(function FeedingWidget({ babyId, records, isError, isLoading, size, mutate }: BaseWidgetProps) {
    const { executeRecord } = useQuickRecord(babyId, { onSuccess: mutate })

    const { todayCount, lastElapsed, lastFeedingType, lastAmount } = useMemo(() => {
        const feedingRecords = records
            ?.map(normalizeFeedingFromRecord)
            .filter((f): f is NormalizedFeeding => f !== null) ?? []
        const stats = calculateFeedingStats(feedingRecords)
        const last = feedingRecords[0]
        return {
            ...stats,
            lastFeedingType: last?.type || "BOTTLE",
            lastAmount: last?.amount
        }
    }, [records])

    const handleQuickFeeding = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const action = async () => api.post<{ id: number }>("/feedings/", {
            baby_id: Number(babyId),
            feeding_type: lastFeedingType,
            feeding_time: new Date().toISOString(),
            ...(lastFeedingType !== "BREAST" && lastAmount ? { amount_ml: lastAmount } : {}),
        })

        await executeRecord(action, { 
            feedbackType: RECORD_TYPES.FEEDING, 
            label: lastFeedingType === "BOTTLE" ? "ミルク" : lastFeedingType === "BREAST" ? "母乳" : "授乳"
        })
    }

    return (
        <div onClick={handleQuickFeeding} className="cursor-pointer">
            <HexagonWidgetCard
                title="授乳"
                icon={<Milk className="w-5 h-5 text-rose-500" />}
                isError={isError}
                isLoading={isLoading}
                size={size}
                className="hover:shadow-rose-100 dark:hover:shadow-rose-900/20"
            >
                <div className="flex flex-col items-center">
                    <span className="font-bold text-gray-800 dark:text-zinc-200">{lastElapsed}</span>
                    <span className="text-[10px] text-gray-500 dark:text-zinc-500 mt-0.5">今日 {todayCount}回</span>
                </div>
            </HexagonWidgetCard>
        </div>
    )
}, createWidgetMemoComparison('feeding'))
