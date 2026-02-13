import { create } from 'zustand'
import type { TimerStatus } from '@/types/contraction'

interface ContractionTimerState {
    status: TimerStatus
    startTime: Date | null
    elapsedSeconds: number
    start: () => void
    stop: () => { startTime: Date; endTime: Date; durationSeconds: number } | null
    tick: () => void
    reset: () => void
}

export const useContractionTimer = create<ContractionTimerState>((set, get) => ({
    status: 'idle',
    startTime: null,
    elapsedSeconds: 0,

    start: () => {
        set({
            status: 'timing',
            startTime: new Date(),
            elapsedSeconds: 0,
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
