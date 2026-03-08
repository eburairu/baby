import { Feeding, FeedingCreate, FeedingUpdate } from '@/types/feeding';
import { useMemo } from 'react';
import { normalizeFeedingFromEntity, calculateFeedingStats, FeedingStatsResult } from '@/lib/feedingUtils';
import { useBaseRecord } from './useBaseRecord';

/**
 * 授乳記録を扱うフック
 */
export function useFeeding(babyId: string | number | null) {
    const {
        data: feedings,
        isLoading,
        isError,
        add,
        update,
        remove,
        refresh,
    } = useBaseRecord<Feeding, FeedingCreate, FeedingUpdate>(babyId, 'feedings', 'feeding_id');

    const summary: FeedingStatsResult = useMemo(() => {
        const normalizedFeedings = feedings?.map(normalizeFeedingFromEntity) ?? [];
        return calculateFeedingStats(normalizedFeedings);
    }, [feedings]);

    return {
        feedings,
        loading: isLoading,
        error: isError,
        summary,
        addFeeding: add,
        updateFeeding: update,
        deleteFeeding: remove,
        refresh,
    };
}
