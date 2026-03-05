import { Diaper, DiaperType } from "@/types/diaper";
import { BabyRecord } from "@/types/record";
import { formatElapsed } from "@/lib/ageUtils";
import { isToday } from "@/lib/dateUtils";
import { format, subDays, isSameDay } from "date-fns";

export interface NormalizedDiaper {
    id: number;
    timestamp: string; // ISO String
    type: DiaperType;
}

export function normalizeDiaperFromRecord(record: BabyRecord): NormalizedDiaper | null {
    if (record.type !== 'diaper') return null;
    return {
        id: record.id,
        timestamp: record.timestamp,
        type: record.details.diaper_type as DiaperType
    };
}

export function normalizeDiaperFromEntity(diaper: Diaper): NormalizedDiaper {
    return {
        id: diaper.id,
        timestamp: diaper.change_time,
        type: diaper.diaper_type
    };
}

export interface DiaperStatsResult {
    wetCount: number;
    dirtyCount: number;
    lastWetTime: string | null;
    lastDirtyTime: string | null;
    lastWetElapsed: string | null;
    lastDirtyElapsed: string | null;
    lastElapsed: string | null;
}

export function calculateDiaperStats(diapers: NormalizedDiaper[]): DiaperStatsResult {
    const todayDiapers = diapers.filter((d) => isToday(d.timestamp));

    const wetDiapers = todayDiapers.filter(
        (d) => d.type === DiaperType.WET || d.type === DiaperType.BOTH
    );
    const dirtyDiapers = todayDiapers.filter(
        (d) => d.type === DiaperType.DIRTY || d.type === DiaperType.BOTH
    );

    const wetCount = wetDiapers.length;
    const dirtyCount = dirtyDiapers.length;

    const lastWet = diapers.find(
        (d) => d.type === DiaperType.WET || d.type === DiaperType.BOTH
    );
    const lastDirty = diapers.find(
        (d) => d.type === DiaperType.DIRTY || d.type === DiaperType.BOTH
    );

    const lastRecord = diapers[0];

    return {
        wetCount,
        dirtyCount,
        lastWetTime: lastWet ? lastWet.timestamp : null,
        lastDirtyTime: lastDirty ? lastDirty.timestamp : null,
        lastWetElapsed: lastWet ? formatElapsed(lastWet.timestamp) : null,
        lastDirtyElapsed: lastDirty ? formatElapsed(lastDirty.timestamp) : null,
        lastElapsed: lastRecord ? formatElapsed(lastRecord.timestamp) : null
    };
}

export interface DailyDiaperData {
    date: string    // "M/d" 表示用
    wet: number
    dirty: number
}

export function calculateDailyDiaperStats(diapers: NormalizedDiaper[], days = 7): DailyDiaperData[] {
    const today = new Date()
    return Array.from({ length: days }, (_, i) => {
        const day = subDays(today, days - 1 - i)
        const dayDiapers = diapers.filter(d => isSameDay(new Date(d.timestamp), day))
        const wet = dayDiapers.filter(d => d.type === DiaperType.WET || d.type === DiaperType.BOTH).length
        const dirty = dayDiapers.filter(d => d.type === DiaperType.DIRTY || d.type === DiaperType.BOTH).length
        return {
            date: format(day, 'M/d'),
            wet,
            dirty,
        }
    })
}
