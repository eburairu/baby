import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { BabyRecord } from "@/types/record";

// 100件取得してフロント側の無限スクロールで段階表示する。
// デフォルト20件だと1日の記録数が多い場合に昨日以前が取得されない問題があった。
const RECORDS_FETCH_LIMIT = 100

export function useRecords(babyId: string | null) {
    const { data, error, isLoading, mutate } = useSWR<BabyRecord[]>(
        babyId ? `/babies/${babyId}/records?limit=${RECORDS_FETCH_LIMIT}` : null,
        fetcher,
        { keepPreviousData: true }
    );
    return {
        records: data,
        isLoading,
        isError: error,
        mutate,
    };
}
