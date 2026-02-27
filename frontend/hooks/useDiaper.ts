import { useBabyResource } from "@/hooks/useBabyResource";
import type { Diaper, DiaperCreate, DiaperUpdate } from '@/types/diaper';
import { client, throwOnError } from '@/lib/api-client';

export function useDiapers(babyId: string | number | null) {
    const { data, isLoading, isError, mutate } = useBabyResource<Diaper>('diapers', babyId);

    const addDiaper = async (data: DiaperCreate): Promise<Diaper | undefined> => {
        if (!babyId) return undefined;
        const newRecord = await throwOnError(client.POST('/api/diapers/', {
            body: data
        }));
        mutate();
        return newRecord;
    };

    const updateDiaper = async (id: number, data: DiaperUpdate): Promise<Diaper | undefined> => {
        if (!babyId) return undefined;
        // The generated path parameter name is diaper_id based on api.d.ts
        // In api.d.ts: "/api/diapers/{diaper_id}"
        // But the error says: Argument of type '"/api/diapers/{diaper_id}"' is not assignable to parameter of type 'PathsWithMethod<paths, "patch">'
        // Let's check api.d.ts again.
        // "/api/diapers/{diaper_id}": { ... put: ..., delete: ... } NO PATCH!
        // It seems update_diaper is PUT, not PATCH.

        const updatedRecord = await throwOnError(client.PUT('/api/diapers/{diaper_id}', {
            params: { path: { diaper_id: id } },
            body: data
        }));
        mutate();
        return updatedRecord;
    };

    return {
        diapers: data,
        isLoading,
        isError,
        mutate,
        addDiaper,
        updateDiaper,
    };
}
