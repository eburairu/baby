"use client"
import { useState, useMemo, memo } from "react"
import { areRecordsEqual } from "@/lib/memoUtils"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/usePermissions"
import { api, isApiError } from "@/lib/api"
import { formatElapsed, isToday } from "@/lib/ageUtils"
import { DiaperType } from "@/types/diaper"
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

export const DiaperWidget = memo(function DiaperWidget({ babyId, records, isError, mutate, isLoading }: Props) {
    const { canWrite } = usePermissions()
    const [loading, setLoading] = useState(false)
    const { triggerFeedback } = useRecordFeedback(babyId)

    const isAccessDenied = isApiError(isError) && isError.status === 403

    const { wetCount, dirtyCount, elapsed } = useMemo(() => {
        const diaperRecords = records?.filter(r => r.type === 'diaper') ?? []
        const todayDiapers = diaperRecords.filter((d) => isToday(d.timestamp))
        return {
            wetCount: todayDiapers.filter((d) => d.details.diaper_type === DiaperType.WET || d.details.diaper_type === DiaperType.BOTH).length,
            dirtyCount: todayDiapers.filter((d) => d.details.diaper_type === DiaperType.DIRTY || d.details.diaper_type === DiaperType.BOTH).length,
            elapsed: diaperRecords[0] ? formatElapsed(diaperRecords[0].timestamp) : null,
        }
    }, [records])

    const handleQuickRecord = async (diaperType: DiaperType, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (loading) return
        setLoading(true)
        const typeLabel = diaperType === DiaperType.WET ? "おしっこ" : "うんち"
        try {
            const record = await api.post<{ id: number }>("/diapers/", {
                baby_id: Number(babyId),
                diaper_type: diaperType,
                change_time: new Date().toISOString(),
            })
            toast.success(`${typeLabel}を記録しました`)
            triggerFeedback("diaper", record.id)
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
            title="👶 おむつ"
            titleClassName="text-amber-500 dark:text-amber-400"
            href={`/diaper?baby_id=${babyId}`}
            isAccessDenied={isAccessDenied}
            isLoading={isLoading}
            loadingColorClass="text-amber-400"
            actionButtonClassName="hover:text-amber-500 dark:hover:text-amber-400"
        >
            <div>
                {elapsed ? (
                    <p className="text-2xl font-bold text-gray-800 dark:text-zinc-100">{elapsed}</p>
                ) : (
                    <p className="text-sm text-gray-400 dark:text-zinc-600" data-sentry-unmask>記録なし</p>
                )}
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                    今日: 💧{wetCount} / 💩{dirtyCount}
                </p>
            </div>
            {canWrite ? (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        loading={loading}
                        disabled={loading}
                        onClick={(e) => handleQuickRecord(DiaperType.WET, e)}
                        className="flex-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-0 text-xs h-8"
                        variant="outline"
                        aria-label="おしっこ"
                        data-sentry-unmask
                    >
                        💧
                    </Button>
                    <Button
                        size="sm"
                        loading={loading}
                        disabled={loading}
                        onClick={(e) => handleQuickRecord(DiaperType.DIRTY, e)}
                        className="flex-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-0 text-xs h-8"
                        variant="outline"
                        aria-label="うんち"
                        data-sentry-unmask
                    >
                        💩
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
    return areRecordsEqual(prev.records, next.records, 'diaper')
})
