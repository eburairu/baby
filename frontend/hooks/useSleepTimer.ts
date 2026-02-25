import { useState, useCallback, useEffect } from "react"
import { useSleeps } from "@/hooks/useData"
import { api } from "@/lib/api"
import { formatElapsed } from "@/lib/ageUtils"
import { useInterval } from "@/hooks/useInterval"

export function useSleepTimer(babyId: string) {
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

    const startSleep = async () => {
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

    const endSleep = async () => {
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

    return {
        isSleeping,
        elapsed,
        loading,
        startSleep,
        endSleep,
    }
}
