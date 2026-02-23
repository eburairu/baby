"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSleeps } from "@/hooks/useData"
import { api } from "@/lib/api"
import { formatElapsed } from "@/lib/ageUtils"
import { Moon, Sun } from "lucide-react"
import { useInterval } from "@/hooks/useInterval"

interface Props {
    babyId: string
}

export function SleepTimer({ babyId }: Props) {
    const { sleeps, mutate } = useSleeps(babyId)
    const [loading, setLoading] = useState(false)
    const [elapsed, setElapsed] = useState<string | null>(null)

    const activeSleep = sleeps?.find((s) => !s.end_time) ?? null
    const isSleeping = !!activeSleep

    const updateElapsed = useCallback(() => {
        if (activeSleep) {
            setElapsed(formatElapsed(activeSleep.start_time))
        } else {
            setElapsed(null)
        }
    }, [activeSleep])

    // 1分ごとに経過時間を更新
    useInterval(updateElapsed, isSleeping ? 60000 : null)

    // 初期表示および activeSleep 変更時の更新
    useEffect(() => {
        updateElapsed()
    }, [updateElapsed])

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
        <Card className="rounded-2xl shadow-sm border-0 overflow-hidden transition-colors">
            <CardContent className="p-6 flex flex-col items-center justify-center space-y-6">
                <div className={`relative flex items-center justify-center w-32 h-32 rounded-full transition-colors duration-500 ${isSleeping ? "bg-indigo-100 dark:bg-indigo-950/30" : "bg-orange-50 dark:bg-orange-950/30"}`}>
                    {isSleeping ? (
                        <Moon className="w-16 h-16 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                    ) : (
                        <Sun className="w-16 h-16 text-orange-400 dark:text-orange-300" />
                    )}
                </div>

                <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                        {isSleeping ? "現在睡眠中" : "起きています"}
                    </p>
                    {isSleeping && (
                        <p className="text-4xl font-bold text-gray-800 dark:text-zinc-100 tracking-tight font-mono">
                            {elapsed}
                        </p>
                    )}
                </div>

                <Button
                    size="lg"
                    loading={loading}
                    onClick={isSleeping ? handleEnd : handleStart}
                    className={`w-full max-w-xs h-12 rounded-xl text-base font-semibold transition-all duration-300 shadow-md ${isSleeping
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none"
                            : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200 dark:shadow-none"
                        }`}
                >
                    {loading ? "処理中..." : (isSleeping ? "おはよう (Stop)" : "おやすみ (Start)")}
                </Button>
            </CardContent>
        </Card>
    )
}
