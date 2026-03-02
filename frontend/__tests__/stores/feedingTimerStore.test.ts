import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useFeedingTimerStore } from '../../stores/feedingTimerStore'

describe('useFeedingTimerStore', () => {
    beforeEach(() => {
        useFeedingTimerStore.getState().reset()
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should have initial state', () => {
        const state = useFeedingTimerStore.getState()
        expect(state.activeSide).toBeNull()
        expect(state.leftElapsedSeconds).toBe(0)
        expect(state.rightElapsedSeconds).toBe(0)
        expect(state.segmentStartTime).toBeNull()
    })

    it('should sync state correctly', () => {
        const now = new Date('2024-01-01T12:00:00Z')
        vi.setSystemTime(now)

        const segmentStartTime = new Date(now.getTime() - 30000) // 30 seconds ago
        
        useFeedingTimerStore.getState().sync('LEFT', 10, 20, segmentStartTime)
        
        const state = useFeedingTimerStore.getState()
        expect(state.activeSide).toBe('LEFT')
        expect(state.leftElapsedSeconds).toBe(10 + 30) // base + (now - segmentStartTime)
        expect(state.rightElapsedSeconds).toBe(20)
        expect(state.segmentStartTime).toEqual(now) // The segmentStartTime is set to `nowForNextSegment` internally
    })

    it('should tick correctly when active', () => {
        const now = new Date('2024-01-01T12:00:00Z')
        vi.setSystemTime(now)

        const segmentStartTime = new Date(now.getTime())
        useFeedingTimerStore.getState().sync('RIGHT', 10, 20, segmentStartTime)

        vi.advanceTimersByTime(5000) // 5 seconds
        useFeedingTimerStore.getState().tick()

        const state = useFeedingTimerStore.getState()
        expect(state.activeSide).toBe('RIGHT')
        expect(state.leftElapsedSeconds).toBe(10)
        expect(state.rightElapsedSeconds).toBe(20 + 5)
    })

    it('should switch sides and preserve elapsed time', () => {
        const now = new Date('2024-01-01T12:00:00Z')
        vi.setSystemTime(now)

        // Start LEFT
        useFeedingTimerStore.getState().start('LEFT')
        vi.advanceTimersByTime(10000) // 10 seconds
        useFeedingTimerStore.getState().tick()

        expect(useFeedingTimerStore.getState().leftElapsedSeconds).toBe(10)

        // Switch to RIGHT
        useFeedingTimerStore.getState().start('RIGHT')
        expect(useFeedingTimerStore.getState().leftElapsedSeconds).toBe(10)
        expect(useFeedingTimerStore.getState().activeSide).toBe('RIGHT')
        
        vi.advanceTimersByTime(5000) // 5 seconds
        useFeedingTimerStore.getState().tick()
        expect(useFeedingTimerStore.getState().rightElapsedSeconds).toBe(5)
        expect(useFeedingTimerStore.getState().leftElapsedSeconds).toBe(10)
    })

    it('should stop and reset', () => {
        useFeedingTimerStore.getState().start('LEFT')
        vi.advanceTimersByTime(10000)
        useFeedingTimerStore.getState().tick()

        useFeedingTimerStore.getState().stop()
        expect(useFeedingTimerStore.getState().activeSide).toBeNull()
        expect(useFeedingTimerStore.getState().segmentStartTime).toBeNull()
        expect(useFeedingTimerStore.getState().leftElapsedSeconds).toBe(10)

        useFeedingTimerStore.getState().reset()
        expect(useFeedingTimerStore.getState().leftElapsedSeconds).toBe(0)
    })
})
