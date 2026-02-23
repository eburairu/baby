"use client"
import { useMemo, memo } from "react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/usePermissions"
import { api } from "@/lib/api"
import { formatElapsed, isToday } from "@/lib/ageUtils"
import { DiaperType } from "@/types/diaper"
import { useRecordFeedback } from "@/hooks/useRecordFeedback"
import { WidgetCard } from "./WidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { WidgetContent } from "./WidgetContent"

export const DiaperWidget = memo(function DiaperWidget({ babyId, records, isError, mutate, isLoading }: BaseWidgetProps) {
    const { canWrite } = usePermissions()
    const { loading, execute } = useAsyncAction()
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

        const typeLabel = diaperType === DiaperType.WET ? "おしっこ" : "うんち"

        await execute(async () => {
            const record = await api.post<{ id: number }>("/diapers/", {
                baby_id: Number(babyId),
                diaper_type: diaperType,
                change_time: new Date().toISOString(),
            })
            triggerFeedback("diaper", record.id)
            if (mutate) mutate()
            return record
        }, {
            successMessage: `${typeLabel}を記録しました`,
            errorMessage: `${typeLabel}の記録に失敗しました`
        })
    }

    return (
        <WidgetCard
            title={<span className="text-amber-500 dark:text-amber-400">👶 おむつ</span>}
            href={`/diaper?baby_id=${babyId}`}
            isError={isError}
            actionHoverColor="hover:text-amber-500 dark:hover:text-amber-400"
        >
            <WidgetContent
                isLoading={isLoading}
                loadingColorClass="text-amber-400"
                elapsed={elapsed}
                subContent={`今日: 💧${wetCount} / 💩${dirtyCount}`}
            />
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
}, createWidgetMemoComparison('diaper'))
