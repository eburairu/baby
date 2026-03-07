import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import type { Baby } from '@/types/baby';

export function useBabies(options?: { fallbackData?: Baby[] }) {
    const { data, error, isLoading, mutate } = useSWR<Baby[]>('/babies/', fetcher, {
        ...options,
        shouldRetryOnError: false,
        revalidateOnFocus: true,
        keepPreviousData: true,
    });
    return {
        babies: data,
        isLoading,
        isError: error,
        mutate,
    };
}
