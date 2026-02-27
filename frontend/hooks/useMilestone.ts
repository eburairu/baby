import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { useBabyResource } from "@/hooks/useBabyResource";
import type { Milestone, MilestoneTimelineGroup } from '@/types/milestone';

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
