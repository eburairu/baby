"use client"
import { useState, useMemo, memo } from "react"
import { areRecordsEqual } from "@/lib/memoUtils"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/usePermissions"
import { api } from "@/lib/api"
import { formatElapsed, isToday } from "@/lib/ageUtils"
import { BabyRecord } from "@/hooks/useData"
import { toast } from "sonner"
import { WidgetCard } from "./WidgetCard"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"

interface Props {
    babyId: string
    records?: BabyRecord[]
    isError?: unknown
    mutate?: () => void
    isLoading?: boolean
}

export const SleepWidget = memo(function SleepWidget({ babyId, records, isError, mutate, isLoading }: Props) {
    const { canWrite } = usePermissions()
    const [loading, setLoading] = useState(false)

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
        if (loading) return
        setLoading(true)
        try {
            await api.post("/sleeps/", {
                baby_id: Number(babyId),
                start_time: new Date().toISOString(),
            })
            toast.success("睡眠を開始しました")
            if (mutate) mutate()
        } catch (e) {
            console.error(e)
            toast.error("睡眠の開始に失敗しました")
        } finally {
            setLoading(false)
        }
    }

    const handleEnd = async () => {
        if (!activeSleep || loading) return
        setLoading(true)
        try {
            await api.patch(`/sleeps/${activeSleep.id}`, {
                end_time: new Date().toISOString(),
            })
            toast.success("睡眠を終了しました")
            if (mutate) mutate()
        } catch (e) {
            console.error(e)
            toast.error("睡眠の終了に失敗しました")
        } finally {
            setLoading(false)
        }
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
            <div>
                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <BabyBottleLoading className="w-8 h-8 text-indigo-400" />
                    </div>
                ) : isSleeping ? (
                    <>
                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400" data-sentry-unmask>睡眠中</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-zinc-100">{elapsed}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">今日の合計: {todayTotal}</p>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">
                            {lastElapsed ? `${lastElapsed}に起床` : "記録なし"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">今日の合計: {todayTotal}</p>
                    </>
                )}
            </div>
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
}, (prev, next) => {
    if (prev.isLoading !== next.isLoading) return false
    if (prev.isError !== next.isError) return false
    if (prev.babyId !== next.babyId) return false
    if (prev.mutate !== next.mutate) return false
    return areRecordsEqual(prev.records, next.records, 'sleep')
})
