"use client"
import { useMemo, memo } from "react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { api } from "@/lib/api"
import { DiaperType } from "@/types/diaper"
import { WidgetCard } from "./WidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { WidgetContent } from "./WidgetContent"
import { WidgetQuickButton } from "./WidgetQuickButton"
import { useQuickRecord } from "@/hooks/useQuickRecord"
import { calculateDiaperStats, NormalizedDiaper, normalizeDiaperFromRecord } from "@/lib/diaperUtils"

export const DiaperWidget = memo(function DiaperWidget({ babyId, records, isError, mutate, isLoading }: BaseWidgetProps) {
    const { canWrite, loading, executeRecord } = useQuickRecord(babyId, { onSuccess: mutate })

    const { wetCount, dirtyCount, lastElapsed } = useMemo(() => {
        const diaperRecords = records
            ?.map(normalizeDiaperFromRecord)
            .filter((d): d is NormalizedDiaper => d !== null) ?? []
        return calculateDiaperStats(diaperRecords)
    }, [records])

    const handleQuickRecord = async (diaperType: DiaperType) => {
        const typeLabel = diaperType === DiaperType.WET ? "おしっこ" : "うんち"

        await executeRecord(async () => {
            return api.post<{ id: number }>("/diapers/", {
                baby_id: Number(babyId),
                diaper_type: diaperType,
                change_time: new Date().toISOString(),
            })
        }, {
            label: typeLabel,
            feedbackType: "diaper"
        })
    }

    return (
        <WidgetCard
            title={<span className="text-amber-500 dark:text-amber-400">👶 おむつ</span>}
            href={`/diaper?baby_id=${babyId}`}
            isError={isError}
            actionHoverColor="hover:text-amber-500 dark:hover:text-amber-400"
            ariaLabel="排泄の詳細を見る"
        >
            <WidgetContent
                isLoading={isLoading}
                loadingColorClass="text-amber-400"
                elapsed={lastElapsed}
                subContent={`今日: 💧${wetCount} / 💩${dirtyCount}`}
            />
            {canWrite ? (
                <div className="flex gap-2">
                    <WidgetQuickButton
                        color="amber"
                        loading={loading}
                        disabled={loading}
                        onClick={() => handleQuickRecord(DiaperType.WET)}
                        className="flex-1"
                        aria-label="おしっこ"
                    >
                        💧
                    </WidgetQuickButton>
                    <WidgetQuickButton
                        color="amber"
                        loading={loading}
                        disabled={loading}
                        onClick={() => handleQuickRecord(DiaperType.DIRTY)}
                        className="flex-1"
                        aria-label="うんち"
                    >
                        💩
                    </WidgetQuickButton>
                </div>
            ) : null}
        </WidgetCard>
    )
}, createWidgetMemoComparison('diaper'))
