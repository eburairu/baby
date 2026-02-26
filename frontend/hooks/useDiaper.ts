import { useBabyResource } from "@/hooks/useBabyResource";
import type { Diaper } from '@/types/diaper';

export function useDiapers(babyId: string | number | null) {
    const { data, isLoading, isError, mutate } = useBabyResource<Diaper>('diapers', babyId);
    return {
        diapers: data,
        isLoading,
        isError,
        mutate,
    };
}
