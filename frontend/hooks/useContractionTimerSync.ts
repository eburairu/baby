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

/**
 * バックエンドの陣痛タイマー状態をポーリング同期するフック
 * 
 * @param babyId 赤ちゃんのID
 * @returns mutate: 手動更新関数, error: エラーオブジェクト
 */
export function useContractionTimerSync(babyId: number | null) {
    const sync = useContractionTimer(state => state.sync)

    const { data, mutate, error } = useSWR<TimerResponse>(
        babyId ? `/babies/${babyId}/timer/contraction` : null,
        fetcher,
        {
            refreshInterval: 3000,
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
