import { useMemo } from "react"
import { BabyRecord } from "@/types/record"

/**
 * 指定した日付の記録を返す。
 * すでに取得済みの records（useRecords の結果）からクライアント側でフィルタする。
 */
export function useRecordsByDate(
    records: BabyRecord[] | undefined,
    date: Date
): BabyRecord[] {
    const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    return useMemo(() => {
        if (!records) return []
        const [y, m, d] = dateStr.split("-").map(Number)
        return records.filter(r => {
            const t = new Date(r.timestamp)
            return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d
        })
    }, [records, dateStr])
}
