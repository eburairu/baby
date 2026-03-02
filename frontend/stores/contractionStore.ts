import { create } from 'zustand'
import type { TimerStatus } from '@/types/contraction'

interface ContractionTimerState {
    status: TimerStatus
    startTime: Date | null
    elapsedSeconds: number
    start: (offsetMs?: number) => void
    stop: () => { startTime: Date; endTime: Date; durationSeconds: number } | null
    sync: (status: TimerStatus, startTime: string | Date | null) => void
    tick: () => void
    reset: () => void
}

export const useContractionTimer = create<ContractionTimerState>((set, get) => ({
    status: 'idle',
    startTime: null,
    elapsedSeconds: 0,

    start: (offsetMs = 0) => {
        const startTime = new Date(Date.now() - offsetMs)
        const elapsedSeconds = Math.round(offsetMs / 1000)
        set({
            status: 'timing',
            startTime,
            elapsedSeconds,
        })
    },

    stop: () => {
        const { startTime } = get()
        if (!startTime) return null

        const endTime = new Date()
        const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000)

        set({
            status: 'idle',
            startTime: null,
            elapsedSeconds: 0,
        })

        return { startTime, endTime, durationSeconds }
    },

    sync: (status, startTime) => {
        let startTimeDate: Date | null = null
        if (startTime) {
            startTimeDate = typeof startTime === 'string' ? new Date(startTime) : startTime
        }

        let elapsedSeconds = 0
        if (status === 'timing' && startTimeDate) {
            elapsedSeconds = Math.round((Date.now() - startTimeDate.getTime()) / 1000)
        }

        set({
            status,
            startTime: startTimeDate,
            elapsedSeconds,
        })
    },

    tick: () => {
        const { startTime, status } = get()
        if (status !== 'timing' || !startTime) return
        const elapsed = Math.round((Date.now() - startTime.getTime()) / 1000)
        set({ elapsedSeconds: elapsed })
    },

    reset: () => {
        set({
            status: 'idle',
            startTime: null,
            elapsedSeconds: 0,
        })
    },
}))
