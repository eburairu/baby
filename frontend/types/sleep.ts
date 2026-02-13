export interface Sleep {
    id: number;
    user_id: number;
    baby_id: number;
    start_time: string; // ISO 8601
    end_time: string | null; // ISO 8601
    notes: string | null;
}

export interface SleepCreate {
    baby_id: number;
    start_time: string;
    end_time?: string;
    notes?: string;
}
