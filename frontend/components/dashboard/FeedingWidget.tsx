"use client"
import { useMemo, memo } from "react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { usePermissions } from "@/hooks/usePermissions"
import { api } from "@/lib/api"
import { formatElapsed, isToday } from "@/lib/ageUtils"
import { useRecordFeedback } from "@/hooks/useRecordFeedback"
import { WidgetCard } from "./WidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { WidgetContent } from "./WidgetContent"
import { WidgetQuickButton } from "./WidgetQuickButton"

export const FeedingWidget = memo(function FeedingWidget({ babyId, records, isError, mutate, isLoading }: BaseWidgetProps) {
    const { canWrite } = usePermissions()
    const { loading, execute } = useAsyncAction()
    const { triggerFeedback } = useRecordFeedback(babyId)

    const { todayCount, elapsed } = useMemo(() => {
        const feedingRecords = records?.filter(r => r.type === 'feeding') ?? []
        return {
            todayCount: feedingRecords.filter((f) => isToday(f.timestamp)).length,
            elapsed: feedingRecords[0] ? formatElapsed(feedingRecords[0].timestamp) : null,
        }
    }, [records])

    const handleQuickRecord = async (feedingType: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const typeLabel = feedingType === "bottle" ? "ミルク" : "母乳"

        await execute(async () => {
            const record = await api.post<{ id: number }>("/feedings/", {
                baby_id: Number(babyId),
                feeding_type: feedingType.toUpperCase(),
                feeding_time: new Date().toISOString(),
            })
            triggerFeedback("feeding", record.id)
            if (mutate) mutate()
            return record
        }, {
            successMessage: `${typeLabel}を記録しました`,
            errorMessage: `${typeLabel}の記録に失敗しました`
        })
    }

    return (
        <WidgetCard
            title={<span className="text-rose-500 dark:text-rose-400">🍼 授乳</span>}
            href={`/feeding?baby_id=${babyId}`}
            isError={isError}
            actionHoverColor="hover:text-rose-500 dark:hover:text-rose-400"
            ariaLabel="授乳の詳細を見る"
        >
            <WidgetContent
                isLoading={isLoading}
                loadingColorClass="text-rose-400"
                elapsed={elapsed}
                subContent={`今日: ${todayCount}回`}
            />
            {canWrite ? (
                <div className="flex gap-2">
                    <WidgetQuickButton
                        color="rose"
                        loading={loading}
                        disabled={loading}
                        onClick={(e) => handleQuickRecord("bottle", e)}
                        className="flex-1"
                    >
                        ミルク
                    </WidgetQuickButton>
                    <WidgetQuickButton
                        color="rose"
                        loading={loading}
                        disabled={loading}
                        onClick={(e) => handleQuickRecord("breast", e)}
                        className="flex-1"
                    >
                        母乳
                    </WidgetQuickButton>
                </div>
            ) : null}
        </WidgetCard>
    )
}, createWidgetMemoComparison('feeding'))
