'use client'

import useSWR from 'swr'
import { useEffect } from 'react'
import { fetcher } from '@/lib/api'
import { useFeedingTimerStore } from '@/stores/feedingTimerStore'

interface TimerResponse {
  active_side: 'LEFT' | 'RIGHT' | null
  left_elapsed_seconds: number
  right_elapsed_seconds: number
  segment_start_time: string | null
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
      // API レスポンスの snake_case をストアの期待する引数にマッピング
      // また、値が undefined や null の場合に 0 をデフォルト値として渡すことで NaN を防止
      sync(
        data.active_side,
        data.left_elapsed_seconds ?? 0,
        data.right_elapsed_seconds ?? 0,
        data.segment_start_time
      )
    }
  }, [data, sync])

  return { mutate, error }
}
