import { useBabyResource } from "@/hooks/useBabyResource";
import type { Vaccination } from '@/types/vaccination';

export function useVaccinations(babyId: string | number | null) {
    const { data, isLoading, isError, mutate } = useBabyResource<Vaccination>('vaccinations', babyId);
    return {
        vaccinations: data,
        isLoading,
        isError,
        mutate,
    };
}
