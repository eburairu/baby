import useSWR from 'swr';
import { fetcher, api } from '@/lib/api';
import { Feeding, FeedingCreate, FeedingSummary, FeedingType } from '@/types/feeding';
import { useMemo } from 'react';

export function useFeeding(babyId: number | null) {
    const { data: feedings, error, mutate } = useSWR<Feeding[]>(
        babyId ? `/feedings/?baby_id=${babyId}` : null,
        fetcher
    );

    const loading = !feedings && !error;

    const summary: FeedingSummary = useMemo(() => {
        if (!feedings) {
            return {
                today_count: 0,
                today_duration: 0,
                today_amount: 0,
                last_feeding_time: null,
                last_feeding_type: null,
            };
        }

        const today = new Date().toDateString();
        const todayFeedings = feedings.filter(
            (f) => new Date(f.feeding_time).toDateString() === today
        );

        const breastFeedings = todayFeedings.filter(
            (f) => f.feeding_type === 'BREAST' || f.feeding_type === 'MIXED'
        );
        const bottleFeedings = todayFeedings.filter(
            (f) => f.feeding_type === 'BOTTLE' || f.feeding_type === 'MIXED'
        );

        const totalDuration = breastFeedings.reduce(
            (sum, f) => sum + (f.duration_minutes || 0),
            0
        );
        const totalAmount = bottleFeedings.reduce(
            (sum, f) => sum + (f.amount_ml || 0),
            0
        );

        const lastFeeding = feedings.length > 0 ? feedings[0] : null;

        return {
            today_count: todayFeedings.length,
            today_duration: totalDuration,
            today_amount: totalAmount,
            last_feeding_time: lastFeeding?.feeding_time ?? null,
            last_feeding_type: lastFeeding?.feeding_type ?? null,
        };
    }, [feedings]);

    const addFeeding = async (data: FeedingCreate) => {
        if (!babyId) return;
        await api.post('/feedings/', data);
        mutate();
    };

    const deleteFeeding = async (id: number) => {
        await api.delete(`/feedings/${id}`);
        mutate();
    };

    return {
        feedings,
        loading,
        error,
        summary,
        addFeeding,
        deleteFeeding,
    };
}
