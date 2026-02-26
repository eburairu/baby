import { BabyRecord } from "./record";

export interface Vaccination extends BabyRecord {
    type: 'note'; // Vaccinations are stored as notes with specific metadata
    vaccine_id: string;
    administered_at: string;
    next_dose_due?: string;
}
