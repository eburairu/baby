import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import type { Baby } from '@/types/baby';
import { Family, FamilyMember } from "@/types/family";
import { BabyRecord } from "@/types/record";

// Re-export hooks from their new locations for backward compatibility
export { useContractions } from '@/hooks/useContraction';
export { useSleeps } from '@/hooks/useSleep';
export { useDiapers } from '@/hooks/useDiaper';
export { useGrowths } from '@/hooks/useGrowth';

export function useFamilySettings() {
    const { data, error, isLoading, mutate } = useSWR<Family>('/family/', fetcher);
    return {
        family: data,
        isLoading,
        isError: error,
        mutate,
    };
}

export function useFamilyMembers() {
    const { data, error, isLoading, mutate } = useSWR<FamilyMember[]>('/family/members', fetcher);
    return {
        members: data,
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
        keepPreviousData: true,
    });
    return {
        babies: data,
        isLoading,
        isError: error,
        mutate,
    };
}

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
