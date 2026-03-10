import { useBabyResource } from "@/hooks/useBabyResource";
import type { ContractionRecord } from '@/types/contraction';

export function useContractions(babyId: string | number | null) {
    const { data, isLoading, isError, mutate } = useBabyResource<ContractionRecord>('contractions', babyId);
    return {
        contractions: data,
        isLoading,
        isError,
        mutate,
    };
}
