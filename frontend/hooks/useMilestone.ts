import { useBabyResource } from "@/hooks/useBabyResource";
import type { Milestone } from '@/types/milestone';

export function useMilestoneTimeline(babyId: string | number | null) {
    const { data, isLoading, isError, mutate } = useBabyResource<Milestone>('milestones', babyId);
    return {
        milestones: data,
        isLoading,
        isError,
        mutate,
    };
}
