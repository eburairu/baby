"use client"

import { memo } from "react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { HexagonWidgetCard } from "./HexagonWidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import { Ruler } from "lucide-react"
import Link from "next/link"

export const GrowthWidget = memo(function GrowthWidget({ babyId, records, isLoading, isError }: BaseWidgetProps) {
    const growthRecords = records?.filter(r => r.type === 'growth') ?? []
    const latest = growthRecords[0] ?? null

    const dateStr = latest?.timestamp 
        ? `${new Date(latest.timestamp).getMonth() + 1}/${new Date(latest.timestamp).getDate()}`
        : null

    const weight = latest?.details.weight_kg as number | undefined
    const height = latest?.details.height_cm as number | undefined

    return (
        <Link href={`/growth?baby_id=${babyId}`} className="block">
            <HexagonWidgetCard
                title="成長"
                icon={<Ruler className="w-5 h-5 text-emerald-500" />}
                isError={!!isError}
                isLoading={isLoading}
                className="hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20"
            >
                <div className="flex flex-col items-center">
                    {latest ? (
                        <>
                            <span className="font-bold text-gray-800 dark:text-zinc-200">
                                {weight != null ? `${weight * 1000}g` : height != null ? `${height}cm` : "-"}
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-zinc-500 mt-0.5">
                                {dateStr}測定 {height != null && weight != null ? `/ ${height}cm` : ""}
                            </span>
                        </>
                    ) : (
                        <span className="text-[10px] text-gray-500 dark:text-zinc-600">記録なし</span>
                    )}
                </div>
            </HexagonWidgetCard>
        </Link>
    )
}, createWidgetMemoComparison('growth'))
