export type FeedingType = 'BREAST' | 'BOTTLE' | 'MIXED';

export interface Feeding {
    id: number;
    user_id: number;
    baby_id: number;
    feeding_time: string; // ISO 8601
    feeding_type: FeedingType;
    amount_ml?: number | null;
    duration_minutes?: number | null;
    notes?: string | null;
}

export interface FeedingCreate {
    baby_id: number;
    feeding_time: string; // ISO 8601
    feeding_type: FeedingType;
    amount_ml?: number;
    duration_minutes?: number;
    notes?: string;
}

export interface FeedingSummary {
    today_count: number;
    today_duration: number; // minutes
    today_amount: number; // ml
    last_feeding_time: string | null; // ISO 8601
    last_feeding_type: FeedingType | null;
}
