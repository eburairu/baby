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
    return useMemo(() => {
        if (!records) return []
        const y = date.getFullYear()
        const m = date.getMonth()
        const d = date.getDate()
        return records.filter(r => {
            const t = new Date(r.timestamp)
            return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d
        })
    }, [records, date.getFullYear(), date.getMonth(), date.getDate()])
}
