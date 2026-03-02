import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useContractionTimer } from '../stores/contractionStore'

describe('useContractionTimer sync', () => {
    beforeEach(() => {
        useContractionTimer.getState().reset()
    })

    it('should sync timing status and calculate elapsedSeconds', () => {
        const now = Date.now()
        const tenSecondsAgo = new Date(now - 10000)
        
        // Mocking Date.now() for consistency
        vi.spyOn(Date, 'now').mockReturnValue(now)

        useContractionTimer.getState().sync('timing', tenSecondsAgo)

        const state = useContractionTimer.getState()
        expect(state.status).toBe('timing')
        expect(state.startTime?.getTime()).toBe(tenSecondsAgo.getTime())
        expect(state.elapsedSeconds).toBe(10)
        
        vi.restoreAllMocks()
    })

    it('should sync timing status from string ISO date', () => {
        const now = Date.now()
        const tenSecondsAgo = new Date(now - 10000)
        const isoString = tenSecondsAgo.toISOString()
        
        vi.spyOn(Date, 'now').mockReturnValue(now)

        useContractionTimer.getState().sync('timing', isoString)

        const state = useContractionTimer.getState()
        expect(state.status).toBe('timing')
        expect(state.startTime).toBeInstanceOf(Date)
        expect(state.startTime?.getTime()).toBe(new Date(isoString).getTime())
        expect(state.elapsedSeconds).toBe(10)

        vi.restoreAllMocks()
    })

    it('should set elapsedSeconds to 0 for idle status', () => {
        useContractionTimer.getState().sync('idle', null)

        const state = useContractionTimer.getState()
        expect(state.status).toBe('idle')
        expect(state.startTime).toBeNull()
        expect(state.elapsedSeconds).toBe(0)
    })
})
