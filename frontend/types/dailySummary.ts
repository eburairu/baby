export interface DailySummary {
    id: number;
    baby_id: number;
    user_id: number | null;
    summary_date: string; // "YYYY-MM-DD"
    display_content: string;
    generated_content: string;
    edited_content: string | null;
    is_edited: boolean;
    model_name: string | null;
    image_urls: string[];
    created_at: string;
    updated_at: string;
}

export interface DailySummaryCreate {
    summary_date: string;
}

export interface DailySummaryEdit {
    edited_content: string | null;
    image_urls: string[];
}
