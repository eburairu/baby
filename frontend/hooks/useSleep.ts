import { useBabyResource } from "@/hooks/useBabyResource";
import type { Sleep } from '@/types/sleep';

export function useSleeps(babyId: string | number | null) {
    const { data, isLoading, isError, mutate } = useBabyResource<Sleep>('sleeps', babyId);
    return {
        sleeps: data,
        isLoading,
        isError,
        mutate,
    };
}
