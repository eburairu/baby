"use client"
import { useMemo, memo } from "react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { WidgetCard } from "./WidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { WidgetContent } from "./WidgetContent"
import { calculateSleepStats } from "@/lib/sleepUtils"
import { Moon } from "lucide-react"

export const SleepWidget = memo(function SleepWidget({ babyId, records, isError, isLoading }: BaseWidgetProps) {
    const { isSleeping, todayTotal, elapsed, lastElapsed } = useMemo(() => {
        return calculateSleepStats(records)
    }, [records])

    return (
        <WidgetCard
            title={
                <span className="text-indigo-500 dark:text-indigo-400 flex items-center">
                    <Moon className="w-4 h-4 mr-1" /> 睡眠
                    {isSleeping ? (
                        <span className="ml-1 inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    ) : null}
                </span>
            }
            href={`/sleep?baby_id=${babyId}`}
            isError={isError}
            actionHoverColor="hover:text-indigo-500 dark:hover:text-indigo-400"
            ariaLabel="睡眠の詳細を見る"
        >
            <WidgetContent
                isLoading={isLoading}
                loadingColorClass="text-indigo-400"
                elapsed={elapsed}
                emptyContent={lastElapsed ? `${lastElapsed}に起床` : "記録なし"}
                emptyContentClassName="text-gray-500 dark:text-zinc-400"
                subContent={`今日の合計: ${todayTotal}`}
            >
                {isSleeping && (
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400" data-sentry-unmask>睡眠中</p>
                )}
            </WidgetContent>
        </WidgetCard>
    )
}, createWidgetMemoComparison('sleep'))
