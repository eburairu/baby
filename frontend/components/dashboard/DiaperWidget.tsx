"use client"
import { useMemo, memo } from "react"
import { Baby, Droplets, Biohazard } from "lucide-react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { WidgetCard } from "./WidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { WidgetContent } from "./WidgetContent"
import { calculateDiaperStats, NormalizedDiaper, normalizeDiaperFromRecord } from "@/lib/diaperUtils"

export const DiaperWidget = memo(function DiaperWidget({ babyId, records, isError, isLoading }: BaseWidgetProps) {
    const { wetCount, dirtyCount, lastElapsed } = useMemo(() => {
        const diaperRecords = records
            ?.map(normalizeDiaperFromRecord)
            .filter((d): d is NormalizedDiaper => d !== null) ?? []
        return calculateDiaperStats(diaperRecords)
    }, [records])

    return (
        <WidgetCard
            title={<span className="text-amber-500 dark:text-amber-400 flex items-center gap-1"><Baby className="w-4 h-4" /> おむつ</span>}
            href={`/diaper?baby_id=${babyId}`}
            isError={isError}
            actionHoverColor="hover:text-amber-500 dark:hover:text-amber-400"
            ariaLabel="排泄の詳細を見る"
        >
            <WidgetContent
                isLoading={isLoading}
                loadingColorClass="text-amber-400"
                elapsed={lastElapsed}
                subContent={<span className="flex items-center gap-1">今日: <Droplets className="w-3 h-3 inline-block" />{wetCount} / <Biohazard className="w-3 h-3 inline-block" />{dirtyCount}</span>}
            />
        </WidgetCard>
    )
}, createWidgetMemoComparison('diaper'))
