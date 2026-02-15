export interface User {
    id: number;
    username: string;
    display_name: string | null;
    role?: string;
    created_at: string;
}
