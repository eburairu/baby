import useSWR from 'swr';
import { fetcher } from '@/lib/api';

export function useBabies() {
    const { data, error, isLoading, mutate } = useSWR('/babies/', fetcher);
    return {
        babies: data,
        isLoading,
        isError: error,
        mutate,
    };
}

export function useRecords(babyId: string | null) {
    const { data, error, isLoading, mutate } = useSWR(babyId ? `/api/babies/${babyId}/records` : null, fetcher);
    return {
        records: data,
        isLoading,
        isError: error,
        mutate,
    };
}
