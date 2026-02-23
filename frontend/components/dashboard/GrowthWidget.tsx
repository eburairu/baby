"use client"
import { memo } from "react"
import { areRecordsEqual } from "@/lib/memoUtils"
import { BabyRecord } from "@/types/record"
import { WidgetCard } from "./WidgetCard"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"

interface Props {
  babyId: string
  records?: BabyRecord[]
  isLoading?: boolean
  isError?: unknown
}

export const GrowthWidget = memo(function GrowthWidget({ babyId, records, isLoading, isError }: Props) {
    const growthRecords = records?.filter(r => r.type === 'growth') ?? []
    const latest = growthRecords[0] ?? null

    const measureDate = latest?.timestamp
        ? new Date(latest.timestamp).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })
        : null

    const weight = latest?.details.weight_kg as number | undefined
    const height = latest?.details.height_cm as number | undefined

    return (
        <WidgetCard
            title={<span className="text-emerald-500 dark:text-emerald-400">📏 成長</span>}
            href={`/growth?baby_id=${babyId}`}
            isError={isError}
            actionHoverColor="hover:text-emerald-500 dark:hover:text-emerald-400"
            ariaLabel="成長の詳細を見る"
        >
            {isLoading ? (
                <div className="flex justify-center py-4">
                    <BabyBottleLoading className="w-8 h-8 text-emerald-400" />
                </div>
            ) : latest ? (
                <div className="space-y-1">
                    {weight != null && (
                        <p className="text-2xl font-bold text-gray-800 dark:text-zinc-100">
                            {weight * 1000} <span className="text-sm font-normal text-gray-500 dark:text-zinc-400">g</span>
                        </p>
                    )}
                    {height != null && (
                        <p className="text-sm text-gray-600 dark:text-zinc-300">
                            身長 {height} cm
                        </p>
                    )}
                    {measureDate && (
                        <p className="text-xs text-gray-400 dark:text-zinc-500">{measureDate}測定</p>
                    )}
                </div>
            ) : (
                <p className="text-sm text-gray-400 dark:text-zinc-600" data-sentry-unmask>記録なし</p>
            )}
        </WidgetCard>
    )
}, (prev, next) => {
    if (prev.isLoading !== next.isLoading) return false
    if (prev.isError !== next.isError) return false
    if (prev.babyId !== next.babyId) return false
    return areRecordsEqual(prev.records, next.records, 'growth')
})
