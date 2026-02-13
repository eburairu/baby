export interface Growth {
    id: number;
    user_id: number;
    baby_id: number;
    date: string; // ISO 8601 (date)
    weight: number | null; // in grams
    height: number | null; // in cm
    head_circumference: number | null; // in cm
    notes: string | null;
}

export interface GrowthCreate {
    baby_id: number;
    date: string;
    weight?: number;
    height?: number;
    head_circumference?: number;
    notes?: string;
}
