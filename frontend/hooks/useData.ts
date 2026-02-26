import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import type { ContractionRecord } from '@/types/contraction';
import type { Diaper } from '@/types/diaper';
import type { Sleep } from '@/types/sleep';
import type { Growth } from '@/types/growth';
import type { Vaccination } from '@/types/vaccination';
import type { Milestone, MilestoneTimelineGroup } from '@/types/milestone';
import type { Baby } from '@/types/baby';
import { Family, FamilyMember } from "@/types/family";
import { BabyRecord } from "@/types/record";
import { useBabyResource } from "@/hooks/useBabyResource";

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

export function useContractions(babyId: string | number | null) {
    const { data, isLoading, isError, mutate } = useBabyResource<ContractionRecord>('contractions', babyId);
    return {
        contractions: data,
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

export function useVaccinations(babyId: string | number | null) {
    const { data, isLoading, isError, mutate } = useBabyResource<Vaccination>('vaccinations', babyId);
    return {
        vaccinations: data,
        isLoading,
        isError,
        mutate,
    };
}

export function useMilestones(babyId: string | number | null) {
    const { data, isLoading, isError, mutate } = useBabyResource<Milestone>('milestones', babyId);
    return {
        milestones: data,
        isLoading,
        isError,
        mutate,
    };
}

export function useMilestoneTimeline(babyId: string | number | null) {
    const { data, error, isLoading, mutate } = useSWR<MilestoneTimelineGroup[]>(
        babyId ? `/milestones/timeline?baby_id=${babyId}` : null,
        fetcher,
        { keepPreviousData: true }
    );
    return {
        timeline: data,
        isLoading,
        isError: error,
        mutate,
    };
}
