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

const ACTIVE_INTERVAL_MS = 3000
const IDLE_INTERVAL_MS = 15000

/**
 * 授乳タイマーの状態をバックエンドから定期的に取得し、Zustand ストアに同期するフック。
 * タイマー動作中は3秒、アイドル時は15秒でポーリングする。
 */
export function useFeedingTimerSync(babyId: number | null) {
  const sync = useFeedingTimerStore((state) => state.sync)
  const activeSide = useFeedingTimerStore((state) => state.activeSide)

  const { data, mutate, error } = useSWR<TimerResponse>(
    babyId ? `/babies/${babyId}/timer/feeding` : null,
    fetcher,
    {
      refreshInterval: activeSide !== null ? ACTIVE_INTERVAL_MS : IDLE_INTERVAL_MS,
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
