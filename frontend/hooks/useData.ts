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
    const { data, error, isLoading, mutate } = useSWR(babyId ? `/babies/${babyId}/records` : null, fetcher);
    return {
        records: data,
        isLoading,
        isError: error,
        mutate,
    };
}

export function useContractions(babyId: number | null) {
    const { data, error, isLoading, mutate } = useSWR(
        babyId ? `/contractions/?baby_id=${babyId}` : null,
        fetcher
    );
    return {
        contractions: data,
        isLoading,
        isError: error,
        mutate,
    };
}
