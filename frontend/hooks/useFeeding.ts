import useSWR from 'swr';
import { fetcher, api } from '@/lib/api';
import { Feeding, FeedingCreate, FeedingSummary } from '@/types/feeding';
import { useMemo } from 'react';

export function useFeeding(babyId: number | null) {
    const { data: feedings, error, mutate } = useSWR<Feeding[]>(
        babyId ? `/feedings/?baby_id=${babyId}` : null,
        fetcher
    );

    const loading = !feedings && !error;

    const summary: FeedingSummary = useMemo(() => {
        if (!feedings || feedings.length === 0) {
            return {
                today_count: 0,
                today_duration: 0,
                today_amount: 0,
                last_feeding_time: null,
                last_feeding_type: null,
            };
        }

        const now = new Date();
        const todayYear = now.getFullYear();
        const todayMonth = now.getMonth();
        const todayDate = now.getDate();

        let todayCount = 0;
        let todayDuration = 0;
        let todayAmount = 0;

        for (const f of feedings) {
            const d = new Date(f.feeding_time);
            if (d.getDate() === todayDate && d.getMonth() === todayMonth && d.getFullYear() === todayYear) {
                todayCount++;

                const type = f.feeding_type;
                if (type === 'BREAST' || type === 'MIXED') {
                    todayDuration += (f.duration_minutes || 0);
                }
                if (type === 'BOTTLE' || type === 'MIXED') {
                    todayAmount += (f.amount_ml || 0);
                }
            }
        }

        const lastFeeding = feedings[0];

        return {
            today_count: todayCount,
            today_duration: todayDuration,
            today_amount: todayAmount,
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
