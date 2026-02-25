"use client"
import { useMemo, memo } from "react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { useQuickRecord } from "@/hooks/useQuickRecord"
import { api } from "@/lib/api"
import { WidgetCard } from "./WidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { WidgetContent } from "./WidgetContent"
import { WidgetQuickButton } from "./WidgetQuickButton"
import { calculateSleepStats } from "@/lib/sleepUtils"
import { Moon } from "lucide-react"

export const SleepWidget = memo(function SleepWidget({ babyId, records, isError, mutate, isLoading }: BaseWidgetProps) {
    const { canWrite, loading, executeRecord } = useQuickRecord(babyId, { onSuccess: mutate })

    const { activeSleep, isSleeping, todayTotal, elapsed, lastElapsed } = useMemo(() => {
        return calculateSleepStats(records)
    }, [records])

    const handleStart = async () => {
        await executeRecord(async () => {
            return api.post<{ id: number }>("/sleeps/", {
                baby_id: Number(babyId),
                start_time: new Date().toISOString(),
            })
        }, {
            successMessage: "睡眠を開始しました",
            errorMessage: "睡眠の開始に失敗しました"
        })
    }

    const handleEnd = async () => {
        if (!activeSleep) return

        const sleepId = activeSleep.id
        await executeRecord(async () => {
            return api.patch<{ id: number }>(`/sleeps/${sleepId}`, {
                end_time: new Date().toISOString(),
            })
        }, {
            successMessage: "睡眠を終了しました",
            errorMessage: "睡眠の終了に失敗しました"
        })
    }

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
            {canWrite ? (
                <WidgetQuickButton
                    color="indigo"
                    isActive={isSleeping}
                    loading={loading}
                    disabled={loading}
                    onClick={isSleeping ? handleEnd : handleStart}
                    className="w-full"
                >
                    {isSleeping ? "睡眠終了" : "睡眠開始"}
                </WidgetQuickButton>
            ) : null}
        </WidgetCard>
    )
}, createWidgetMemoComparison('sleep'))
