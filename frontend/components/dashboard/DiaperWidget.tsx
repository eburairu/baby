"use client"

import { useMemo, memo } from "react"
import { Droplets, Biohazard } from "lucide-react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { HexagonWidgetCard } from "./HexagonWidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { calculateDiaperStats, NormalizedDiaper, normalizeDiaperFromRecord } from "@/lib/diaperUtils"
import { calcProgress, isOverThreshold } from "@/lib/indicatorUtils"
import Link from "next/link"
import { useTick } from "@/hooks/useTick"
import { AppIcons } from "@/constants/icons"
import { AnimatedNumber } from "@/components/ui/animated-number"

export const DiaperWidget = memo(function DiaperWidget({ babyId, records, isError, isLoading, size, thresholdMinutes }: BaseWidgetProps) {
    const tick = useTick()

    const { wetCount, dirtyCount, lastElapsed, lastDiaperTime } = useMemo(() => {
        // tick に依存させることで1分ごとの更新を保証する
        void tick;
        const diaperRecords = records
            ?.map(normalizeDiaperFromRecord)
            .filter((d): d is NormalizedDiaper => d !== null) ?? []
        const stats = calculateDiaperStats(diaperRecords)
        return {
            ...stats,
            lastDiaperTime: diaperRecords[0]?.timestamp ?? null
        }
    }, [records, tick])

    const progress = thresholdMinutes != null
        ? calcProgress(lastDiaperTime, thresholdMinutes)
        : 0
    const isOver = isOverThreshold(progress)

    return (
        <Link href={`/diaper?baby_id=${babyId}`} className="block">
            <HexagonWidgetCard
                title="おむつ"
                icon={<AppIcons.diaper className="w-5 h-5 text-amber-500" />}
                isError={isError}
                isLoading={isLoading}
                size={size}
                className="hover:shadow-amber-100 dark:hover:shadow-amber-900/20"
                indicatorProgress={thresholdMinutes != null ? progress : undefined}
                isOverThreshold={isOver}
            >
                <div className="flex flex-col items-center">
                    <span className="font-bold text-gray-800 dark:text-zinc-200">{lastElapsed}</span>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 dark:text-zinc-500">
                        <span className="flex items-center gap-0.5"><Droplets className="w-2.5 h-2.5" /><AnimatedNumber value={wetCount} /></span>
                        <span className="flex items-center gap-0.5"><Biohazard className="w-2.5 h-2.5" /><AnimatedNumber value={dirtyCount} /></span>
                    </div>
                </div>
            </HexagonWidgetCard>
        </Link>
    )
}, createWidgetMemoComparison('diaper'))
