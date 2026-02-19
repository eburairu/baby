import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import type { ContractionRecord } from '@/types/contraction';
import type { Feeding } from '@/types/feeding';
import type { Diaper } from '@/types/diaper';
import type { Sleep } from '@/types/sleep';
import type { Growth } from '@/types/growth';
import type { Baby } from '@/types/baby';

export function useFamilySettings() {
    const { data, error, isLoading, mutate } = useSWR('/family/', fetcher);
    return {
        family: data as { id: number; name: string; invite_code: string; created_at: string } | undefined,
        isLoading,
        isError: error,
        mutate,
    };
}

export function useFamilyMembers() {
    const { data, error, isLoading, mutate } = useSWR('/family/members', fetcher);
    return {
        members: data as { user_id: number; username: string; display_name: string | null; role: string; joined_at: string }[] | undefined,
        isLoading,
        isError: error,
        mutate,
    };
}

export function useBabies(options?: { fallbackData?: Baby[] }) {
    const { data, error, isLoading, mutate } = useSWR<Baby[]>('/babies/', fetcher, {
        ...options,
        shouldRetryOnError: false,
        revalidateOnFocus: true,
        revalidateOnMount: true,
    });
    return {
        babies: data,
        isLoading,
        isError: error,
        mutate,
    };
}

function useBabyResource<T>(endpoint: string, babyId: string | number | null) {
    const { data, error, isLoading, mutate } = useSWR<T[]>(
        babyId ? `/${endpoint}/?baby_id=${babyId}` : null,
        fetcher
    );
    return {
        data,
        isLoading,
        isError: error,
        mutate,
    };
}


export interface BabyRecord {
    id: number;
    type: 'feeding' | 'sleep' | 'diaper' | 'growth' | 'contraction' | 'note';
    timestamp: string;
    details: {
        notes?: string;
        [key: string]: unknown;
    };
    comment_count: number;
    recorded_by_display_name?: string | null;
}

export function useRecords(baby_id: string | null, limit?: number) {
    const { data, error, isLoading, mutate } = useSWR<BabyRecord[]>(
        baby_id ? `/babies/${baby_id}/records${limit ? `?limit=${limit}` : ""}` : null,
        fetcher
    );
    return {
        records: data,
        isLoading,
        isError: error,
        mutate,
    };
}

export function useContractions(babyId: string | number | null) {
    const { data, isLoading, isError, mutate } = useBabyResource<ContractionRecord>('contractions', babyId);
    return {
        contractions: data,
        isLoading,
        isError,
        mutate,
    };
}

export function useFeedings(babyId: string | number | null) {
    const { data, isLoading, isError, mutate } = useBabyResource<Feeding>('feedings', babyId);
    return {
        feedings: data,
        isLoading,
        isError,
        mutate,
    };
}

export function useSleeps(babyId: string | number | null) {
    const { data, isLoading, isError, mutate } = useBabyResource<Sleep>('sleeps', babyId);
    return {
        sleeps: data,
        isLoading,
        isError,
        mutate,
    };
}

export function useDiapers(babyId: string | number | null) {
    const { data, isLoading, isError, mutate } = useBabyResource<Diaper>('diapers', babyId);
    return {
        diapers: data,
        isLoading,
        isError,
        mutate,
    };
}

export function useGrowths(babyId: string | number | null) {
    const { data, isLoading, isError, mutate } = useBabyResource<Growth>('growths', babyId);
    return {
        growths: data,
        isLoading,
        isError,
        mutate,
    };
}
