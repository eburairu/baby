"use client"
import { useState, useMemo, memo } from "react"
import { areRecordsEqual } from "@/lib/memoUtils"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/usePermissions"
import { api, isApiError } from "@/lib/api"
import { formatElapsed, isToday } from "@/lib/ageUtils"
import { BabyRecord } from "@/hooks/useData"
import { toast } from "sonner"
import { useRecordFeedback } from "@/hooks/useRecordFeedback"
import { WidgetCard } from "./WidgetCard"

interface Props {
    babyId: string
    records?: BabyRecord[]
    isError?: unknown
    mutate?: () => void
    isLoading?: boolean
}

export const FeedingWidget = memo(function FeedingWidget({ babyId, records, isError, mutate, isLoading }: Props) {
    const { canWrite } = usePermissions()
    const [loading, setLoading] = useState(false)
    const { triggerFeedback } = useRecordFeedback(babyId)

    const isAccessDenied = isApiError(isError) && isError.status === 403

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
        if (loading) return
        setLoading(true)
        const typeLabel = feedingType === "bottle" ? "ミルク" : "母乳"
        try {
            const record = await api.post<{ id: number }>("/feedings/", {
                baby_id: Number(babyId),
                feeding_type: feedingType.toUpperCase(),
                feeding_time: new Date().toISOString(),
            })
            toast.success(`${typeLabel}を記録しました`)
            triggerFeedback("feeding", record.id)
            if (mutate) mutate()
        } catch (e) {
            console.error(e)
            toast.error(`${typeLabel}の記録に失敗しました`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <WidgetCard
            title="🍼 授乳"
            titleClassName="text-rose-500 dark:text-rose-400"
            href={`/feeding?baby_id=${babyId}`}
            isAccessDenied={isAccessDenied}
            isLoading={isLoading}
            loadingColorClass="text-rose-400"
            actionButtonClassName="hover:text-rose-500 dark:hover:text-rose-400"
        >
            <div>
                {elapsed ? (
                    <p className="text-2xl font-bold text-gray-800 dark:text-zinc-100">{elapsed}</p>
                ) : (
                    <p className="text-sm text-gray-400 dark:text-zinc-600" data-sentry-unmask>記録なし</p>
                )}
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">今日: {todayCount}回</p>
            </div>
            {canWrite ? (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        loading={loading}
                        disabled={loading}
                        onClick={(e) => handleQuickRecord("bottle", e)}
                        className="flex-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border-0 text-xs h-8"
                        variant="outline"
                        data-sentry-unmask
                    >
                        ミルク
                    </Button>
                    <Button
                        size="sm"
                        loading={loading}
                        disabled={loading}
                        onClick={(e) => handleQuickRecord("breast", e)}
                        className="flex-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border-0 text-xs h-8"
                        variant="outline"
                        data-sentry-unmask
                    >
                        母乳
                    </Button>
                </div>
            ) : null}
        </WidgetCard>
    )
}, (prev, next) => {
    if (prev.isLoading !== next.isLoading) return false
    if (prev.isError !== next.isError) return false
    if (prev.babyId !== next.babyId) return false
    if (prev.mutate !== next.mutate) return false
    return areRecordsEqual(prev.records, next.records, 'feeding')
})
