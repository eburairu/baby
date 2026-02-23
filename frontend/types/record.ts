export interface BabyRecord {
    id: number;
    type: 'feeding' | 'sleep' | 'diaper' | 'growth' | 'contraction' | 'note';
    timestamp: string;
    details: {
        notes?: string;
        [key: string]: unknown;
    };
    comment_count: number;
    recorded_by_display_name?: string | null;
}
