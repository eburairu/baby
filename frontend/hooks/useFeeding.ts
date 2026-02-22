import useSWR from 'swr';
import { client, throwOnError } from '@/lib/api-client';
import { Feeding, FeedingCreate, FeedingUpdate, FeedingSummary } from '@/types/feeding';
import { useMemo } from 'react';

export function useFeeding(babyId: number | null) {
    const { data: feedings, error, mutate } = useSWR(
        babyId ? `/api/feedings/?baby_id=${babyId}` : null,
        () => throwOnError(client.GET('/api/feedings/', {
            params: { query: { baby_id: babyId! } }
        })),
        { keepPreviousData: true }
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
                last_breast_side: null,
                today_left_duration: 0,
                today_right_duration: 0,
                last_milk_amount: null,
            };
        }

        const now = new Date();
        const todayYear = now.getFullYear();
        const todayMonth = now.getMonth();
        const todayDate = now.getDate();

        let todayCount = 0;
        let todayDuration = 0;
        let todayAmount = 0;
        let todayLeftDuration = 0;
        let todayRightDuration = 0;

        for (const f of feedings) {
            const d = new Date(f.feeding_time);
            if (d.getDate() === todayDate && d.getMonth() === todayMonth && d.getFullYear() === todayYear) {
                todayCount++;

                const type = f.feeding_type;
                if (type === 'BREAST' || type === 'MIXED') {
                    todayDuration += (f.duration_minutes || 0);
                    todayLeftDuration += (f.left_breast_minutes || 0);
                    todayRightDuration += (f.right_breast_minutes || 0);
                }
                if (type === 'BOTTLE' || type === 'MIXED') {
                    todayAmount += (f.amount_ml || 0);
                }
            }
        }

        // 直近の母乳記録から最終授乳側を取得
        const lastBreastFeeding = feedings.find(
            f => f.feeding_type === 'BREAST' || f.feeding_type === 'MIXED'
        );
        const lastBreastSide = lastBreastFeeding?.last_breast_side ?? null;

        // 直近のミルク記録から前回量を取得
        const lastMilkFeeding = feedings.find(
            f => (f.feeding_type === 'BOTTLE' || f.feeding_type === 'MIXED') && f.amount_ml !== null
        );
        const lastMilkAmount = lastMilkFeeding?.amount_ml ?? null;

        const lastFeeding = feedings[0];

        return {
            today_count: todayCount,
            today_duration: todayDuration,
            today_amount: todayAmount,
            last_feeding_time: lastFeeding?.feeding_time ?? null,
            last_feeding_type: lastFeeding?.feeding_type ?? null,
            last_breast_side: lastBreastSide,
            today_left_duration: todayLeftDuration,
            today_right_duration: todayRightDuration,
            last_milk_amount: lastMilkAmount,
        };
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
