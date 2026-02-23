"use client"
import { useState, useMemo, memo } from "react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/usePermissions"
import { api } from "@/lib/api"
import { formatElapsed, isToday } from "@/lib/ageUtils"
import { DiaperType } from "@/types/diaper"
import { toast } from "sonner"
import { useRecordFeedback } from "@/hooks/useRecordFeedback"
import { WidgetCard } from "./WidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { WidgetLoading } from "./WidgetLoading"

export const DiaperWidget = memo(function DiaperWidget({ babyId, records, isError, mutate, isLoading }: BaseWidgetProps) {
    const { canWrite } = usePermissions()
    const [loadingAction, setLoadingAction] = useState<string | null>(null)
    const { triggerFeedback } = useRecordFeedback(babyId)

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
        if (loadingAction) return
        setLoadingAction(diaperType)
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
            setLoadingAction(null)
        }
    }

    return (
        <WidgetCard
            title={<span className="text-amber-500 dark:text-amber-400">👶 おむつ</span>}
            href={`/diaper?baby_id=${babyId}`}
            isError={isError}
            actionHoverColor="hover:text-amber-500 dark:hover:text-amber-400"
        >
            <div>
                {isLoading ? (
                    <WidgetLoading className="text-amber-400" />
                ) : (
                    <>
                        {elapsed ? (
                            <p className="text-2xl font-bold text-gray-800 dark:text-zinc-100">{elapsed}</p>
                        ) : (
                            <p className="text-sm text-gray-400 dark:text-zinc-600" data-sentry-unmask>記録なし</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                            今日: 💧{wetCount} / 💩{dirtyCount}
                        </p>
                    </>
                )}
            </div>
            {canWrite ? (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        loading={loadingAction === DiaperType.WET}
                        disabled={loadingAction !== null}
                        onClick={(e) => handleQuickRecord(DiaperType.WET, e)}
                        className="flex-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-0 text-xs h-8"
                        variant="outline"
                        aria-label="おしっこ"
                        data-sentry-unmask
                    >
                        <span role="img" aria-hidden="true">💧</span>
                    </Button>
                    <Button
                        size="sm"
                        loading={loadingAction === DiaperType.DIRTY}
                        disabled={loadingAction !== null}
                        onClick={(e) => handleQuickRecord(DiaperType.DIRTY, e)}
                        className="flex-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-0 text-xs h-8"
                        variant="outline"
                        aria-label="うんち"
                        data-sentry-unmask
                    >
                        <span role="img" aria-hidden="true">💩</span>
                    </Button>
                </div>
            ) : null}
        </WidgetCard>
    )
}, createWidgetMemoComparison('diaper'))
