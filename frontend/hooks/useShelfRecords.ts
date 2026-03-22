import useSWR from "swr"
import { fetcher } from "@/lib/api"
import { BabyRecord } from "@/types/record"

/**
 * 棚ビュー用のデータ取得フック。
 * from_date パラメータを使って過去 daysBack 日分のレコードをまとめて取得する。
 * useRecords の 100件キャッシュとは独立して動作する。
 */
export function useShelfRecords(
    babyId: string | null,
    daysBack: number
): { records: BabyRecord[]; isLoading: boolean } {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const fromDate = new Date(today)
    fromDate.setDate(today.getDate() - daysBack)
    const fromDateStr = [
        fromDate.getFullYear(),
        String(fromDate.getMonth() + 1).padStart(2, "0"),
        String(fromDate.getDate()).padStart(2, "0"),
    ].join("-")

    const { data, isLoading } = useSWR<BabyRecord[]>(
        babyId ? `/babies/${babyId}/records?from_date=${fromDateStr}&limit=500` : null,
        fetcher,
        { revalidateOnFocus: false }
    )

    return { records: data ?? [], isLoading }
}
