import useSWR from 'swr';
import { useEffect, useMemo } from 'react';
import { fetcher } from '@/lib/api';
import { BabyRecord } from "@/types/record";
import { SWR_REFRESH_INTERVAL_MS } from "@/constants";

// 100件取得してフロント側の無限スクロールで段階表示する。
// デフォルト20件だと1日の記録数が多い場合に昨日以前が取得されない問題があった。
const RECORDS_FETCH_LIMIT = 100

function getCacheKey(babyId: string) {
    return `records-cache-v1-${babyId}`
}

function readCache(babyId: string): BabyRecord[] | undefined {
    try {
        const raw = sessionStorage.getItem(getCacheKey(babyId))
        return raw ? (JSON.parse(raw) as BabyRecord[]) : undefined
    } catch {
        return undefined
    }
}

function writeCache(babyId: string, data: BabyRecord[]) {
    try {
        sessionStorage.setItem(getCacheKey(babyId), JSON.stringify(data))
    } catch {
        // sessionStorage quota 超過は無視
    }
}

export function useRecords(babyId: string | null) {
    // キャッシュをフォールバックデータとして渡すことで、初回ロード時もスケルトンをスキップできる
    const fallbackData = useMemo(
        () => (babyId ? readCache(babyId) : undefined),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [babyId]
    )

    const { data, error, isLoading, mutate } = useSWR<BabyRecord[]>(
        babyId ? `/babies/${babyId}/records?limit=${RECORDS_FETCH_LIMIT}` : null,
        fetcher,
        {
            keepPreviousData: true,
            refreshInterval: SWR_REFRESH_INTERVAL_MS,
            revalidateOnFocus: true,
            fallbackData,
        }
    );

    // 新しいデータが届いたらキャッシュを更新
    useEffect(() => {
        if (data && babyId) writeCache(babyId, data)
    }, [data, babyId])

    return {
        records: data,
        isLoading,
        isError: error,
        mutate,
    };
}
