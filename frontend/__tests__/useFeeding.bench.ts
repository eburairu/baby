import { bench, describe } from 'vitest';
import { Feeding, FeedingSummary } from '../types/feeding';

// Original Logic
function calculateSummaryOriginal(feedings: Feeding[]): FeedingSummary {
    if (!feedings || feedings.length === 0) {
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
}

// Optimized Logic (Single Pass)
function calculateSummaryOptimized(feedings: Feeding[]): FeedingSummary {
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
}

// Generate large dataset
const generateFeedings = (count: number): Feeding[] => {
    const feedings: Feeding[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const isToday = i % 2 === 0; // 50% chance of being today
        const date = new Date(now);
        if (!isToday) {
            date.setDate(date.getDate() - 1);
        }
        // Slightly vary time to avoid identical timestamps if relevant
        date.setMinutes(date.getMinutes() - i);

        feedings.push({
            id: i,
            user_id: 1,
            baby_id: 1,
            feeding_time: date.toISOString(),
            feeding_type: i % 3 === 0 ? 'BREAST' : i % 3 === 1 ? 'BOTTLE' : 'MIXED',
            duration_minutes: 15,
            amount_ml: 100,
        });
    }
    return feedings;
};

const smallDataset = generateFeedings(50);
const largeDataset = generateFeedings(5000);

describe('Feeding Summary Calculation', () => {
    bench('Original Logic - Small Dataset (50 items)', () => {
        calculateSummaryOriginal(smallDataset);
    });

    bench('Optimized Logic - Small Dataset (50 items)', () => {
        calculateSummaryOptimized(smallDataset);
    });

    bench('Original Logic - Large Dataset (5000 items)', () => {
        calculateSummaryOriginal(largeDataset);
    });

    bench('Optimized Logic - Large Dataset (5000 items)', () => {
        calculateSummaryOptimized(largeDataset);
    });
});
