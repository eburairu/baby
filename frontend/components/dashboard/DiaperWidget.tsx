"use client"

import { useMemo, memo } from "react"
import { Baby, Droplets, Biohazard } from "lucide-react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { HexagonWidgetCard } from "./HexagonWidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { calculateDiaperStats, NormalizedDiaper, normalizeDiaperFromRecord } from "@/lib/diaperUtils"
import { useQuickRecord } from "@/hooks/useQuickRecord"
import { api } from "@/lib/api"
import { RECORD_TYPES } from "@/types/enums"

export const DiaperWidget = memo(function DiaperWidget({ babyId, records, isError, isLoading, size, mutate }: BaseWidgetProps) {
    const { executeRecord } = useQuickRecord(babyId, { onSuccess: mutate })

    const { wetCount, dirtyCount, lastElapsed } = useMemo(() => {
        const diaperRecords = records
            ?.map(normalizeDiaperFromRecord)
            .filter((d): d is NormalizedDiaper => d !== null) ?? []
        return calculateDiaperStats(diaperRecords)
    }, [records])

    const handleQuickWet = async (e: React.MouseEvent) => {
        // タイル全体のクリックで「おしっこ」を記録
        e.preventDefault()
        e.stopPropagation()
        
        const action = async () => api.post<{ id: number }>("/diapers/", {
            baby_id: Number(babyId),
            diaper_type: "WET",
            change_time: new Date().toISOString(),
        })

        await executeRecord(action, { 
            feedbackType: RECORD_TYPES.DIAPER, 
            label: "おしっこ" 
        })
    }

    return (
        <div onClick={handleQuickWet} className="cursor-pointer">
            <HexagonWidgetCard
                title="おむつ"
                icon={<Baby className="w-5 h-5 text-amber-500" />}
                isError={isError}
                isLoading={isLoading}
                size={size}
                className="hover:shadow-amber-100 dark:hover:shadow-amber-900/20"
            >
                <div className="flex flex-col items-center">
                    <span className="font-bold text-gray-800 dark:text-zinc-200">{lastElapsed}</span>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 dark:text-zinc-500">
                        <span className="flex items-center gap-0.5"><Droplets className="w-2.5 h-2.5" />{wetCount}</span>
                        <span className="flex items-center gap-0.5"><Biohazard className="w-2.5 h-2.5" />{dirtyCount}</span>
                    </div>
                </div>
            </HexagonWidgetCard>
        </div>
    )
}, createWidgetMemoComparison('diaper'))
