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

export function useFeedings(babyId: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        babyId ? `/feedings/?baby_id=${babyId}` : null,
        fetcher
    );
    return {
        feedings: data as any[] | undefined,
        isLoading,
        isError: error,
        mutate,
    };
}

export function useSleeps(babyId: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        babyId ? `/sleeps/?baby_id=${babyId}` : null,
        fetcher
    );
    return {
        sleeps: data as any[] | undefined,
        isLoading,
        isError: error,
        mutate,
    };
}

export function useDiapers(babyId: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        babyId ? `/diapers/?baby_id=${babyId}` : null,
        fetcher
    );
    return {
        diapers: data as any[] | undefined,
        isLoading,
        isError: error,
        mutate,
    };
}

export function useGrowths(babyId: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        babyId ? `/growths/?baby_id=${babyId}` : null,
        fetcher
    );
    return {
        growths: data as any[] | undefined,
        isLoading,
        isError: error,
        mutate,
    };
}
