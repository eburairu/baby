import { WHO_STANDARDS } from "../constants/who_standards_data";

interface WhoDataPoint {
    date: number; // timestamp
    p3: number;
    p50: number;
    p97: number;
    month: number;
}

export function generateWhoSeries(
    birthday: Date | string | null,
    gender: string | null | undefined,
    type: 'height' | 'weight' | 'head'
): WhoDataPoint[] {
    if (!birthday || !gender) return [];

    // Normalize gender
    const g = gender.toLowerCase();
    const isMale = g === 'male' || g === 'boy';
    const isFemale = g === 'female' || g === 'girl';

    let dataset: Record<number, { p3: number; p50: number; p97: number }> | undefined;

    if (isMale) {
        // @ts-ignore
        dataset = WHO_STANDARDS.male[type];
    } else if (isFemale) {
        // @ts-ignore
        dataset = WHO_STANDARDS.female[type];
    } else {
        // 'other' or unknown: for now, do not show standards
        return [];
    }

    if (!dataset) return [];

    const birthDate = new Date(birthday);
    const points: WhoDataPoint[] = [];

    // Keys in WHO_STANDARDS are month numbers (0, 1, 2...)
    const months = Object.keys(dataset).map(Number).sort((a, b) => a - b);

    for (const month of months) {
        const data = dataset[month];
        // Calculate date for this month
        // approximate: birthDate + month * 30.44 days? 
        // Better: use setMonth logic
        const targetDate = new Date(birthDate);
        targetDate.setMonth(birthDate.getMonth() + month);

        points.push({
            date: targetDate.getTime(),
            p3: data.p3,
            p50: data.p50,
            p97: data.p97,
            month: month
        });
    }

    return points;
}

export function mergeData(records: any[], whoData: WhoDataPoint[], type: 'height' | 'weight' | 'head') {
    // Combine records and WHO data into a single sorted array for Recharts
    // records have { date: string/Date, height/weight/head... }

    const combinedMap = new Map<string, any>();

    // formatted date key for deduplication? 
    // Recharts uses XAxis timestamp usually.
    // Let's use timestamp as key if possible, but exact match is rare.
    // Actually, we just want a list of points.

    const allPoints = [];

    // Add User Records
    for (const r of records) {
        const d = new Date(r.date);
        allPoints.push({
            date: d.getTime(),
            originalDate: r.date,
            [type]: type === 'weight' ? (r.weight ? r.weight / 1000 : null) : (type === 'height' ? r.height : r.head_circumference),
            // User data does NOT have WHO values initially
        });
    }

    // Add WHO Points
    for (const w of whoData) {
        allPoints.push({
            date: w.date,
            [`who_${type}_p3`]: w.p3,
            [`who_${type}_p50`]: w.p50,
            [`who_${type}_p97`]: w.p97,
            isWhoPoint: true
        });
    }

    // Sort by date
    allPoints.sort((a, b) => a.date - b.date);

    return allPoints;
}
