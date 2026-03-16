"use client"

import { useCallback } from "react"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { useContractionTimer } from "@/stores/contractionStore"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ContractionRecord } from "@/types/contraction"
import { toast } from "sonner"
import { useInterval } from "@/hooks/useInterval"
import { formatTimeMMSS } from "@/lib/ageUtils"
import { useContractionTimerSync } from "@/hooks/useContractionTimerSync"

interface ContractionTimerProps {
    babyId: number
    onRecorded: () => void
    lastContraction?: ContractionRecord
}

export default function ContractionTimer({ babyId, onRecorded }: ContractionTimerProps) {
    const { status, elapsedSeconds, start, stop, tick, sync } = useContractionTimer()
    const { mutate } = useContractionTimerSync(babyId)
    const { loading: isSubmitting, execute } = useAsyncAction()

    const isTiming = status === "timing"

    // 毎秒のtick更新
    useInterval(tick, isTiming ? 1000 : null)

    const handleToggle = useCallback(async (offsetMs: number = 0) => {
        if (status === "idle") {
            const startTime = new Date(Date.now() - offsetMs)
            start(offsetMs)
            try {
                await api.put(`/babies/${babyId}/timer/contraction`, {
                    status: "timing",
                    start_time: startTime.toISOString()
                })
                mutate()
            } catch (err) {
                console.error("Failed to sync timer start", err)
                // サーバー同期に失敗した場合はロールバック
                sync("idle", null)
                toast.error("タイマーの開始に失敗しました。ネットワークを確認してください。")
            }
        } else {
            const result = stop()
            if (result) {
                await execute(
                    async () => {
                        // POST (記録作成) 時に reset_timer: true を指定して同一トランザクションでリセット
                        await api.post("/contractions/", {
                            baby_id: babyId,
                            start_time: result.startTime.toISOString(),
                            end_time: result.endTime.toISOString(),
                            duration_seconds: result.durationSeconds,
                            reset_timer: true
                        })
                    },
                    {
                        successMessage: "記録しました",
                        errorMessage: "保存に失敗しました",
                        onSuccess: () => {
                            onRecorded()
                            mutate()
                        },
                        onError: () => {
                            // サーバーの状態と同期し直す
                            mutate()
                        }
                    }
                )
            }
        }
    }, [status, babyId, start, stop, sync, onRecorded, mutate, execute])

    return (
        <Card className={`transition-all duration-300 ${isTiming ? "border-red-400 bg-red-50 dark:bg-red-950/30 shadow-lg shadow-red-100 dark:shadow-red-900/20" : ""}`}>
            <CardContent className="flex flex-col items-center gap-6 py-8">
                {/* タイマー表示 */}
                <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2" data-sentry-unmask>
                        {isTiming ? "計測中..." : "ボタンを押して計測開始"}
                    </p>
                    <div className={`text-6xl font-mono font-bold tabular-nums tracking-wider ${isTiming ? "text-red-600 dark:text-red-400" : "text-muted-foreground/40"}`}>
                        {formatTimeMMSS(elapsedSeconds)}
                    </div>
                </div>

                {/* ボタン群 */}
                <div className="w-full space-y-3">
                    <Button
                        data-sentry-unmask onClick={() => handleToggle(0)}
                        size="lg"
                        loading={isSubmitting}
                        aria-busy={isSubmitting}
                        className={`h-20 w-full text-2xl font-bold rounded-2xl transition-all duration-200 ${isTiming
                                ? "bg-gray-700 hover:bg-gray-800 text-white"
                                : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-red-900/40"
                            }`}
                    >
                        {isTiming ? "陣痛が終わった" : "🤰 陣痛がきた！"}
                    </Button>

                    {!isTiming && (
                        <Button
                            data-sentry-unmask onClick={() => handleToggle(60000)}
                            variant="outline"
                            className="w-full h-12 text-lg font-medium border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                            1分前から痛かった
                        </Button>
                    )}
                </div>

                {isTiming && (
                    <p className="text-xs text-muted-foreground animate-pulse" data-sentry-unmask>
                        陣痛が終わったらボタンを押してください
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
