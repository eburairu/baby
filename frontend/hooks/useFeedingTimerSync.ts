'use client'

import useSWR from 'swr'
import { useEffect } from 'react'
import { fetcher } from '@/lib/api'
import { useFeedingTimerStore } from '@/stores/feedingTimerStore'

interface TimerResponse {
  activeSide: 'LEFT' | 'RIGHT' | null
  leftElapsedSeconds: number
  rightElapsedSeconds: number
  segmentStartTime: string | null
}

/**
 * 授乳タイマーの状態をバックエンドから定期的に取得し、Zustand ストアに同期するフック。
 */
export function useFeedingTimerSync(babyId: number | null) {
  const sync = useFeedingTimerStore((state) => state.sync)

  const { data, mutate, error } = useSWR<TimerResponse>(
    babyId ? `/babies/${babyId}/timer/feeding` : null,
    fetcher,
    {
      refreshInterval: 3000,
      revalidateOnFocus: true,
    }
  )

  useEffect(() => {
    if (data) {
      sync(
        data.activeSide,
        data.leftElapsedSeconds,
        data.rightElapsedSeconds,
        data.segmentStartTime
      )
    }
  }, [data, sync])

  return { mutate, error }
}
