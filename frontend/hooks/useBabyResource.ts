import useSWR from 'swr';
import { fetcher } from '@/lib/api';

export function useBabyResource<T>(endpoint: string, babyId: string | number | null) {
    const { data, error, isLoading, mutate } = useSWR<T[]>(
        babyId ? `/${endpoint}/?baby_id=${babyId}` : null,
        fetcher,
        { keepPreviousData: true }
    );
    return {
        data,
        isLoading,
        isError: error,
        mutate,
    };
}
