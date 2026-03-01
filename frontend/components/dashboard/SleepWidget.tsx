"use client"

import { useMemo, memo } from "react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { HexagonWidgetCard } from "./HexagonWidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { calculateSleepStats } from "@/lib/sleepUtils"
import { AppIcons } from "@/constants/icons"
import Link from "next/link"
import { useTick } from "@/hooks/useTick"
import { motion } from "framer-motion"

export const SleepWidget = memo(function SleepWidget({ babyId, records, isError, isLoading, size }: BaseWidgetProps) {
    const tick = useTick()

    const { isSleeping, todayTotal, elapsed, lastElapsed } = useMemo(() => {
        // tick に依存させることで1分ごとの更新を保 証する
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        tick;
        return calculateSleepStats(records)
    }, [records, tick])

    return (
        <Link href={`/sleep?baby_id=${babyId}`} className="block">
            <HexagonWidgetCard
                title="睡眠"
                icon={
                    <div className="relative">
                        <AppIcons.sleep className="w-5 h-5 text-indigo-500 relative z-10" />
                        {isSleeping && (
                            <>
                                {/* 波紋状のパルスエフェクト */}
                                <motion.span 
                                    className="absolute inset-0 rounded-full bg-indigo-400/30"
                                    initial={{ scale: 0.8, opacity: 0.5 }}
                                    animate={{ scale: 2.2, opacity: 0 }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "easeOut"
                                    }}
                                />
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500 border-2 border-white dark:border-zinc-900 z-20" />
                            </>
                        )}
                    </div>
                }
                isError={isError}
                isLoading={isLoading}
                size={size}
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
