"use client"

import { useMemo, memo } from "react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { HexagonWidgetCard } from "./HexagonWidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { calculateSleepStats } from "@/lib/sleepUtils"
import { Moon } from "lucide-react"
import Link from "next/link"

export const SleepWidget = memo(function SleepWidget({ babyId, records, isError, isLoading }: BaseWidgetProps) {
    const { isSleeping, todayTotal, elapsed, lastElapsed } = useMemo(() => {
        return calculateSleepStats(records)
    }, [records])

    return (
        <Link href={`/sleep?baby_id=${babyId}`} className="block">
            <HexagonWidgetCard
                title="睡眠"
                icon={
                    <div className="relative">
                        <Moon className="w-5 h-5 text-indigo-500" />
                        {isSleeping && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-400 animate-pulse border-2 border-white dark:border-zinc-900" />
                        )}
                    </div>
                }
                isError={isError}
                isLoading={isLoading}
                className="hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20"
            >
                <div className="flex flex-col items-center">
                    {isSleeping ? (
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{elapsed}経過</span>
                    ) : (
                        <span className="font-bold text-gray-800 dark:text-zinc-200">
                            {lastElapsed ? `${lastElapsed}〜` : "記録なし"}
                        </span>
                    )}
                    <span className="text-[10px] text-gray-500 dark:text-zinc-500 mt-0.5">
                        {isSleeping ? "睡眠中" : `今日 ${todayTotal}`}
                    </span>
                </div>
            </HexagonWidgetCard>
        </Link>
    )
}, createWidgetMemoComparison('sleep'))
