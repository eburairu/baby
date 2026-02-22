import { useState, useRef, useEffect, useCallback } from "react"

export type ActiveBreastSide = "LEFT" | "RIGHT" | null

interface UseFeedingTimerProps {
  initialLeftMinutes?: number
  initialRightMinutes?: number
}

export function useFeedingTimer({
  initialLeftMinutes = 0,
  initialRightMinutes = 0
}: UseFeedingTimerProps = {}) {
    const [leftSeconds, setLeftSeconds] = useState(initialLeftMinutes * 60)
    const [rightSeconds, setRightSeconds] = useState(initialRightMinutes * 60)
    const [activeBreastSide, setActiveBreastSide] = useState<ActiveBreastSide>(null)
    const leftBaseRef = useRef<number | null>(null)
    const rightBaseRef = useRef<number | null>(null)

    // タイマーインターバル
    useEffect(() => {
        if (activeBreastSide === null) return
        const interval = setInterval(() => {
            const now = Date.now()
            if (activeBreastSide === "LEFT" && leftBaseRef.current !== null) {
                const diff = Math.floor((now - leftBaseRef.current) / 1000)
                setLeftSeconds(diff)
            } else if (activeBreastSide === "RIGHT" && rightBaseRef.current !== null) {
                const diff = Math.floor((now - rightBaseRef.current) / 1000)
                setRightSeconds(diff)
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [activeBreastSide])

    const startTimer = (side: "LEFT" | "RIGHT") => {
        // 反対側が動いていれば停止
        if (side === "LEFT" && activeBreastSide === "RIGHT") {
            rightBaseRef.current = null
        } else if (side === "RIGHT" && activeBreastSide === "LEFT") {
            leftBaseRef.current = null
        }

        if (side === "LEFT") {
            leftBaseRef.current = Date.now() - leftSeconds * 1000
        } else {
            rightBaseRef.current = Date.now() - rightSeconds * 1000
        }
        setActiveBreastSide(side)
    }

    const stopTimer = () => {
        setActiveBreastSide(null)
    }

    const toggleTimer = (side: "LEFT" | "RIGHT") => {
        if (activeBreastSide === side) {
            stopTimer()
        } else {
            startTimer(side)
        }
    }

    const resetAllTimers = useCallback(() => {
        setActiveBreastSide(null)
        leftBaseRef.current = null
        rightBaseRef.current = null
        setLeftSeconds(0)
        setRightSeconds(0)
    }, [])

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const totalSeconds = leftSeconds + rightSeconds

    return {
        leftSeconds,
        rightSeconds,
        setLeftSeconds,
        setRightSeconds,
        activeBreastSide,
        toggleTimer,
        resetAllTimers,
        formatTimer,
        totalSeconds
    }
}
