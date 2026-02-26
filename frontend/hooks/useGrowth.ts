import { useBabyResource } from "@/hooks/useBabyResource";
import type { Growth } from '@/types/growth';

export function useGrowths(babyId: string | number | null) {
    const { data, isLoading, isError, mutate } = useBabyResource<Growth>('growths', babyId);
    return {
        growths: data,
        isLoading,
        isError,
        mutate,
    };
}
