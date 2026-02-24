import useSWR from 'swr';
import { client, throwOnError } from '@/lib/api-client';
import { Feeding, FeedingCreate, FeedingUpdate } from '@/types/feeding';
import { useMemo } from 'react';
import { normalizeFeedingFromEntity, calculateFeedingStats, FeedingStatsResult } from '@/lib/feedingUtils';

export function useFeeding(babyId: number | null) {
    const { data: feedings, error, mutate } = useSWR(
        babyId ? `/api/feedings/?baby_id=${babyId}` : null,
        () => throwOnError(client.GET('/api/feedings/', {
            params: { query: { baby_id: babyId! } }
        })),
        { keepPreviousData: true }
    );

    const loading = !feedings && !error;

    const summary: FeedingStatsResult = useMemo(() => {
        const normalizedFeedings = feedings?.map(normalizeFeedingFromEntity) ?? [];
        return calculateFeedingStats(normalizedFeedings);
    }, [feedings]);

    const addFeeding = async (data: FeedingCreate): Promise<Feeding | undefined> => {
        if (!babyId) return undefined;
        const newRecord = await throwOnError(client.POST('/api/feedings/', {
            body: data
        }));
        mutate();
        return newRecord;
    };

    const updateFeeding = async (id: number, data: FeedingUpdate): Promise<Feeding | undefined> => {
        if (!babyId) return undefined;
        const updatedRecord = await throwOnError(client.PATCH('/api/feedings/{feeding_id}', {
            params: { path: { feeding_id: id } },
            body: data
        }));
        mutate();
        return updatedRecord;
    };

    const deleteFeeding = async (id: number) => {
        await throwOnError(client.DELETE('/api/feedings/{feeding_id}', {
            params: { path: { feeding_id: id } }
        }));
        mutate();
    };

    return {
        feedings,
        loading,
        error,
        summary,
        addFeeding,
        updateFeeding,
        deleteFeeding,
        refresh: mutate,
    };
}
