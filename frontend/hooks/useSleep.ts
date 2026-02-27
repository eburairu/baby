import { useBabyResource } from "@/hooks/useBabyResource";
import type { Sleep, SleepCreate, SleepUpdate } from '@/types/sleep';
import { client, throwOnError } from '@/lib/api-client';

export function useSleeps(babyId: string | number | null) {
    const { data, isLoading, isError, mutate } = useBabyResource<Sleep>('sleeps', babyId);

    const addSleep = async (data: SleepCreate): Promise<Sleep | undefined> => {
        if (!babyId) return undefined;
        const newRecord = await throwOnError(client.POST('/api/sleeps/', {
            body: data
        }));
        mutate();
        return newRecord;
    };

    const updateSleep = async (id: number, data: SleepUpdate): Promise<Sleep | undefined> => {
        if (!babyId) return undefined;
        const updatedRecord = await throwOnError(client.PATCH('/api/sleeps/{sleep_id}', {
            params: { path: { sleep_id: id } },
            body: data
        }));
        mutate();
        return updatedRecord;
    };

    return {
        sleeps: data,
        isLoading,
        isError,
        mutate,
        addSleep,
        updateSleep,
    };
}
