import { renderHook, waitFor } from '@testing-library/react'
import { useFeedingTimerSync } from '@/hooks/useFeedingTimerSync'
import { useFeedingTimerStore } from '@/stores/feedingTimerStore'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import useSWR from 'swr'

// Mock useSWR to control response
vi.mock('swr', () => ({
  default: vi.fn(),
}))

describe('useFeedingTimerSync', () => {
  const babyId = 1
  const originalStore = useFeedingTimerStore.getState()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state
    useFeedingTimerStore.setState({
      ...originalStore,
      activeSide: null,
      leftElapsedSeconds: 0,
      rightElapsedSeconds: 0,
      segmentStartTime: null,
    })
  })

  it('should call sync when data is fetched', async () => {
    const now = new Date()
    // 10 seconds ago
    const segmentStartTime = new Date(now.getTime() - 10000)

    const mockData = {
      activeSide: 'LEFT',
      leftElapsedSeconds: 10,
      rightElapsedSeconds: 20,
      segmentStartTime: segmentStartTime.toISOString(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useSWR as any).mockReturnValue({
      data: mockData,
      mutate: vi.fn(),
      error: null,
    })

    renderHook(() => useFeedingTimerSync(babyId))

    await waitFor(() => {
      const state = useFeedingTimerStore.getState()
      expect(state.activeSide).toBe('LEFT')
      // 10 (base) + 10 (diff) = 20 (approx)
      expect(state.leftElapsedSeconds).toBeGreaterThanOrEqual(20)
      expect(state.leftElapsedSeconds).toBeLessThan(25)
      expect(state.rightElapsedSeconds).toBe(20)
    })
  })

  it('should not sync if data is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useSWR as any).mockReturnValue({
      data: null,
      mutate: vi.fn(),
      error: null,
    })

    renderHook(() => useFeedingTimerSync(babyId))

    const state = useFeedingTimerStore.getState()
    expect(state.activeSide).toBeNull()
  })
})
