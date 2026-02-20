"use client"
import { useState, useMemo, memo } from "react"
import { areRecordsEqual } from "@/lib/memoUtils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/usePermissions"
import { api, isApiError } from "@/lib/api"
import { formatElapsed, formatDuration, isToday } from "@/lib/ageUtils"
import Link from "next/link"
import { ArrowRight, ShieldOff } from "lucide-react"
import { BabyRecord } from "@/hooks/useData"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"
import { toast } from "sonner"

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

    const isAccessDenied = isApiError(isError) && isError.status === 403

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

    if (isAccessDenied) {
        return (
            <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 opacity-60 transition-colors">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-400 dark:text-zinc-500 flex items-center gap-1" data-sentry-unmask>
                        💤 睡眠
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                    <ShieldOff className="h-6 w-6 text-gray-300 dark:text-zinc-700 mb-1" />
                    <p className="text-[10px] text-gray-400 dark:text-zinc-600" data-sentry-unmask>閲覧制限中</p>
                </CardContent>
            </Card>
        )
    }



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
        <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-indigo-500 dark:text-indigo-400 flex items-center gap-1" data-sentry-unmask>
                    💤 睡眠
                    {isSleeping ? (
                        <span className="ml-1 inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    ) : null}
                </CardTitle>
                <Link href={`/sleep?baby_id=${babyId}`}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mr-2 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 dark:text-zinc-600"
                        aria-label="睡眠詳細"
                        title="詳細を見る"
                    >
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
        </Card>
    )
}, (prev, next) => {
    if (prev.isLoading !== next.isLoading) return false
    if (prev.isError !== next.isError) return false
    if (prev.babyId !== next.babyId) return false
    if (prev.mutate !== next.mutate) return false
    return areRecordsEqual(prev.records, next.records, 'sleep')
})
