'use client'

import useSWR from 'swr'
import { useEffect } from 'react'
import { fetcher } from '@/lib/api'
import { useContractionTimer } from '@/stores/contractionStore'
import type { TimerStatus } from '@/types/contraction'

interface TimerResponse {
    status: TimerStatus
    start_time: string | null
}

const ACTIVE_INTERVAL_MS = 3000
const IDLE_INTERVAL_MS = 15000

/**
 * バックエンドの陣痛タイマー状態をポーリング同期するフック
 * タイマー動作中は3秒、アイドル時は15秒でポーリングする。
 *
 * @param babyId 赤ちゃんのID
 * @returns mutate: 手動更新関数, error: エラーオブジェクト
 */
export function useContractionTimerSync(babyId: number | null) {
    const sync = useContractionTimer(state => state.sync)
    const timerStatus = useContractionTimer(state => state.status)

    const { data, mutate, error } = useSWR<TimerResponse>(
        babyId ? `/babies/${babyId}/timer/contraction` : null,
        fetcher,
        {
            refreshInterval: timerStatus === 'timing' ? ACTIVE_INTERVAL_MS : IDLE_INTERVAL_MS,
            revalidateOnFocus: true,
        }
    )

    useEffect(() => {
        if (data) {
            sync(data.status, data.start_time)
        } else if (data === null || data === undefined) {
            // データが null または undefined の場合は初期状態（idle）として同期
            sync('idle', null)
        }
    }, [data, sync])

    return { mutate, error }
}
