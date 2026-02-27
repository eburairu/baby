import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { BabyRecord } from "@/types/record";

export function useRecords(babyId: string | null) {
    const { data, error, isLoading, mutate } = useSWR<BabyRecord[]>(
        babyId ? `/babies/${babyId}/records` : null,
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
