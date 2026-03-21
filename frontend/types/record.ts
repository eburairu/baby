export interface BabyRecord {
    id: number;
    type: 'feeding' | 'sleep' | 'diaper' | 'growth' | 'contraction' | 'note';
    timestamp: string;
    details: {
        notes?: string;
        [key: string]: unknown;
    };
    comment_count: number;
    has_ai_feedback?: boolean;
    has_ai_concern?: boolean;
    recorded_by_display_name?: string | null;
    updated_at?: string;
}
