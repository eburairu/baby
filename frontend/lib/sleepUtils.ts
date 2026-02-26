import { BabyRecord } from "@/types/record"
import { formatElapsed } from "@/lib/ageUtils"
import { isToday } from "@/lib/dateUtils"

export interface SleepStats {
    activeSleep: BabyRecord | null
    isSleeping: boolean
    todayTotal: string
    elapsed: string | null
    lastElapsed: string | null
}

export function calculateSleepStats(records: BabyRecord[] = []): SleepStats {
    const sleepRecords = records?.filter(r => r.type === 'sleep') ?? []
    const activeSleep = sleepRecords.find((s) => !s.details.end_time) ?? null

    const todayTotalMin = sleepRecords
        .filter((s) => s.details.end_time && isToday(s.timestamp))
        .reduce((acc: number, s) => {
            const endTime = s.details.end_time
            if (!endTime) return acc
            const ms = new Date(endTime as string).getTime() - new Date(s.timestamp).getTime()
            return acc + Math.floor(ms / 60000)
        }, 0)

    const lastSleep = sleepRecords.find((s) => s.details.end_time)

    return {
        activeSleep,
        isSleeping: !!activeSleep,
        todayTotal: todayTotalMin > 0
            ? `${Math.floor(todayTotalMin / 60)}時間${todayTotalMin % 60}分`
            : "0分",
        elapsed: activeSleep ? formatElapsed(activeSleep.timestamp) : null,
        lastElapsed: lastSleep ? formatElapsed(lastSleep.details.end_time as string) : null,
    }
}
