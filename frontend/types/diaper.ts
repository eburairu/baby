export enum DiaperType {
    WET = "WET",
    DIRTY = "DIRTY",
    BOTH = "BOTH"
}

export interface Diaper {
    id: number;
    user_id: number;
    baby_id: number;
    change_time: string; // ISO 8601
    diaper_type: DiaperType;
    notes?: string;
}
