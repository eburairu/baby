import { useCallback, useEffect } from "react"
import { useFeedingTimerStore } from "@/stores/feedingTimerStore"
import { formatTimeMMSS } from "@/lib/ageUtils"
import { api } from "@/lib/api"

export type ActiveBreastSide = "LEFT" | "RIGHT" | null

interface UseFeedingTimerProps {
  babyId: number | null
  initialLeftMinutes?: number
  initialRightMinutes?: number
}

/**
 * 授乳タイマーのロジックを管理するフック。
 * Zustand ストア (`useFeedingTimerStore`) と連携し、バックエンドへの同期も行う。
 */
export function useFeedingTimer({
  babyId,
  initialLeftMinutes = 0,
  initialRightMinutes = 0
}: UseFeedingTimerProps) {
    const {
        activeSide,
        leftElapsedSeconds,
        rightElapsedSeconds,
        start,
        stop,
        reset,
        tick,
        setLeftSeconds,
        setRightSeconds
    } = useFeedingTimerStore()

    // 1秒ごとにストアの tick を呼び出し、経過時間を更新する
    useEffect(() => {
        if (!activeSide) return
        
        const interval = setInterval(() => {
            tick()
        }, 1000)
        
        return () => clearInterval(interval)
    }, [activeSide, tick])

    /**
     * 現在のタイマー状態をサーバーに保存する。
     */
    const syncWithServer = useCallback(async (side: ActiveBreastSide) => {
        if (!babyId) return
        
        try {
            await api.put(`/babies/${babyId}/timer/feeding`, {
                active_side: side
            })
        } catch (error) {
            console.error("Failed to sync feeding timer to server:", error)
        }
    }, [babyId])

    const toggleTimer = async (side: "LEFT" | "RIGHT") => {
        if (activeSide === side) {
            stop()
            await syncWithServer(null)
        } else {
            start(side)
            await syncWithServer(side)
        }
    }

    const resetAllTimers = useCallback(async () => {
        reset()
        await syncWithServer(null)
    }, [reset, syncWithServer])

    const totalSeconds = leftElapsedSeconds + rightElapsedSeconds

    return {
        leftSeconds: leftElapsedSeconds,
        rightSeconds: rightElapsedSeconds,
        setLeftSeconds,
        setRightSeconds,
        activeBreastSide: activeSide,
        toggleTimer,
        resetAllTimers,
        formatTimer: formatTimeMMSS,
        totalSeconds
    }
}
