"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSleeps } from "@/hooks/useData"
import { api } from "@/lib/api"
import { formatElapsed, formatDuration, isToday } from "@/lib/ageUtils"
import Link from "next/link"
import { ArrowRight, ShieldOff } from "lucide-react"

interface Props {
    babyId: string
}

export function SleepWidget({ babyId }: Props) {
    const { sleeps, isError, mutate } = useSleeps(babyId)
    const [loading, setLoading] = useState(false)

    const isAccessDenied = (isError as any)?.status === 403

    if (isAccessDenied) {
        return (
            <Card className="bg-white rounded-2xl shadow-sm border-0 opacity-60">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-1">
                        💤 睡眠
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                    <ShieldOff className="h-6 w-6 text-gray-300 mb-1" />
                    <p className="text-[10px] text-gray-400">閲覧制限中</p>
                </CardContent>
            </Card>
        )
    }

    const activeSleep = sleeps?.find((s) => !s.end_time) ?? null
    const isSleeping = !!activeSleep

    const todayTotalMin = sleeps
        ?.filter((s) => s.end_time && isToday(s.start_time))
        .reduce((acc: number, s: any) => {
            const ms = new Date(s.end_time).getTime() - new Date(s.start_time).getTime()
            return acc + Math.floor(ms / 60000)
        }, 0) ?? 0
    const todayTotal = todayTotalMin > 0
        ? `${Math.floor(todayTotalMin / 60)}時間${todayTotalMin % 60}分`
        : "0分"

    const elapsed = activeSleep ? formatElapsed(activeSleep.start_time) : null
    const lastSleep = sleeps?.find((s) => s.end_time)
    const lastElapsed = lastSleep ? formatElapsed(lastSleep.end_time!) : null

    const handleStart = async () => {
        setLoading(true)
        try {
            await api.post("/sleeps/", {
                baby_id: Number(babyId),
                start_time: new Date().toISOString(),
            })
            mutate()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleEnd = async () => {
        if (!activeSleep) return
        setLoading(true)
        try {
            await api.patch(`/sleeps/${activeSleep.id}`, {
                end_time: new Date().toISOString(),
            })
            mutate()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="bg-white rounded-2xl shadow-sm border-0">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-indigo-500 flex items-center gap-1">
                    💤 睡眠
                    {isSleeping && (
                        <span className="ml-1 inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    )}
                </CardTitle>
                <Link href={`/sleep?baby_id=${babyId}`}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mr-2 text-gray-400 hover:text-indigo-500"
                        aria-label="睡眠詳細"
                        title="詳細を見る"
                    >
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    {isSleeping ? (
                        <>
                            <p className="text-lg font-bold text-indigo-600">睡眠中</p>
                            <p className="text-2xl font-bold text-gray-800">{elapsed}</p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-gray-500">
                                {lastElapsed ? `${lastElapsed}に起床` : "記録なし"}
                            </p>
                        </>
                    )}
                    <p className="text-xs text-gray-500 mt-1">今日の合計: {todayTotal}</p>
                </div>
                <Button
                    size="sm"
                    loading={loading}
                    onClick={isSleeping ? handleEnd : handleStart}
                    className={`w-full text-xs h-8 border-0 ${isSleeping
                            ? "bg-indigo-500 text-white hover:bg-indigo-600"
                            : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        }`}
                    variant="outline"
                >
                    {isSleeping ? "睡眠終了" : "睡眠開始"}
                </Button>
            </CardContent>
        </Card>
    )
}
