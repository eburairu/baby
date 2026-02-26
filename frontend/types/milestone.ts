import { BabyRecord } from "./record";

export interface Milestone extends BabyRecord {
    type: 'note'; // Milestones are stored as notes with specific metadata in this app
    milestone_id: string;
    achieved_at: string;
}
