import useSWR from "swr"
import { useMemo } from "react"
import { fetcher } from "@/lib/api"
import { BabyRecord } from "@/types/record"

/**
 * 指定した日付の記録を返す。
 * - キャッシュ済み records（useRecords の結果）でカバーできる日付はクライアント側でフィルタ
 * - キャッシュの最古レコードより前の日付は API から直接取得（date パラメータ使用）
 */
export function useRecordsByDate(
    records: BabyRecord[] | undefined,
    babyId: string | null,
    date: Date
): { dayRecords: BabyRecord[]; isLoading: boolean } {
    const y = date.getFullYear()
    const m = date.getMonth()       // 0-indexed
    const d = date.getDate()
    // YYYY-MM-DD（API パラメータ用）
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`

    // キャッシュの最古タイムスタンプ（ms）
    let oldestTs: number | null = null
    if (records && records.length > 0) {
        oldestTs = Math.min(...records.map(r => new Date(r.timestamp).getTime()))
    }

    // 選択日の開始時刻（JST 0時 = ローカル 0時）
    const selStart = new Date(y, m, d).getTime()

    // キャッシュでカバーできない = キャッシュが存在し、かつ選択日がキャッシュ最古より前
    const needsFetch = records !== undefined && oldestTs !== null && selStart < oldestTs

    const { data: fetchedRecords, isLoading } = useSWR<BabyRecord[]>(
        needsFetch && babyId ? `/babies/${babyId}/records?date=${dateStr}&limit=100` : null,
        fetcher,
        { revalidateOnFocus: false }
    )

    // クライアント側フィルタ
    const filteredRecords = useMemo(() => {
        return (records ?? []).filter(r => {
            const t = new Date(r.timestamp)
            return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d
        })
    }, [records, y, m, d])

    if (needsFetch) {
        return { dayRecords: fetchedRecords ?? [], isLoading }
    }

    return { dayRecords: filteredRecords, isLoading: false }
}
