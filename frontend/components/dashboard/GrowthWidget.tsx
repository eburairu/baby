"use client"
import { memo } from "react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { WidgetCard } from "./WidgetCard"
import { WidgetLoading } from "./WidgetLoading"
import { BaseWidgetProps } from "@/types/widget"

export const GrowthWidget = memo(function GrowthWidget({ babyId, records, isLoading, isError }: BaseWidgetProps) {
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
                <WidgetLoading className="text-emerald-400" />
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
}, createWidgetMemoComparison('growth'))
