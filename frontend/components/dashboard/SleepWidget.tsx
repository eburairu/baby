"use client"
import { useMemo, memo } from "react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/usePermissions"
import { api } from "@/lib/api"
import { formatElapsed, isToday } from "@/lib/ageUtils"
import { WidgetCard } from "./WidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { WidgetContent } from "./WidgetContent"

export const SleepWidget = memo(function SleepWidget({ babyId, records, isError, mutate, isLoading }: BaseWidgetProps) {
    const { canWrite } = usePermissions()
    const { loading, execute } = useAsyncAction()

    const { activeSleep, isSleeping, todayTotal, elapsed, lastElapsed } = useMemo(() => {
        const sleepRecords = records?.filter(r => r.type === 'sleep') ?? []
        const activeSleep = sleepRecords.find((s) => !s.details.end_time) ?? null
        const todayTotalMin = sleepRecords
            .filter((s) => s.details.end_time && isToday(s.timestamp))
            .reduce((acc: number, s) => {
                const ms = new Date(s.details.end_time as string).getTime() - new Date(s.timestamp).getTime()
                return acc + Math.floor(ms / 60000)
            }, 0)
        const lastSleep = sleepRecords.find((s) => s.details.end_time)
        return {
            activeSleep,
            isSleeping: !!activeSleep,
            todayTotal: todayTotalMin > 0
                ? `${Math.floor(todayTotalMin / 60)}時間${todayTotalMin % 60}分`
                : "0分",
            elapsed: activeSleep ? formatElapsed(activeSleep.timestamp) : null,
            lastElapsed: lastSleep ? formatElapsed(lastSleep.details.end_time as string) : null,
        }
    }, [records])

    const handleStart = async () => {
        await execute(async () => {
            await api.post("/sleeps/", {
                baby_id: Number(babyId),
                start_time: new Date().toISOString(),
            })
            if (mutate) mutate()
        }, {
            successMessage: "睡眠を開始しました",
            errorMessage: "睡眠の開始に失敗しました"
        })
    }

    const handleEnd = async () => {
        if (!activeSleep) return

        const sleepId = activeSleep.id
        await execute(async () => {
            await api.patch(`/sleeps/${sleepId}`, {
                end_time: new Date().toISOString(),
            })
            if (mutate) mutate()
        }, {
            successMessage: "睡眠を終了しました",
            errorMessage: "睡眠の終了に失敗しました"
        })
    }

    return (
        <WidgetCard
            title={
                <span className="text-indigo-500 dark:text-indigo-400 flex items-center">
                    💤 睡眠
                    {isSleeping ? (
                        <span className="ml-1 inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    ) : null}
                </span>
            }
            href={`/sleep?baby_id=${babyId}`}
            isError={isError}
            actionHoverColor="hover:text-indigo-500 dark:hover:text-indigo-400"
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
                <Button
                    size="sm"
                    loading={loading}
                    disabled={loading}
                    onClick={isSleeping ? handleEnd : handleStart}
                    className={`w-full text-xs h-8 border-0 transition-colors ${isSleeping
                        ? "bg-indigo-500 dark:bg-indigo-600 text-white hover:bg-indigo-600 dark:hover:bg-indigo-700"
                        : "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                        }`}
                    variant="outline"
                    data-sentry-unmask
                >
                    {isSleeping ? "睡眠終了" : "睡眠開始"}
                </Button>
            ) : null}
        </WidgetCard>
    )
}, createWidgetMemoComparison('sleep'))
