"use client"
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"
import { useTheme } from "next-themes"
import { useMemo } from "react"
import { StatsCard } from "@/components/ui/stats-card"
import { calculateDailyStats, NormalizedFeeding } from "@/lib/feedingUtils"
import { normalizeFeedingFromEntity } from "@/lib/feedingUtils"
import type { Feeding } from "@/types/feeding"

interface FeedingChartProps {
    feedings: Feeding[]
}

export function FeedingChart({ feedings }: FeedingChartProps) {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    const data = useMemo(() => {
        const normalized = feedings.map(normalizeFeedingFromEntity)
        return calculateDailyStats(normalized, 7)
    }, [feedings])

    const hasAny = data.some(d => d.count > 0)

    const gridColor = isDark ? "#3f3f46" : "#e5e7eb"
    const textColor = isDark ? "#a1a1aa" : "#6b7280"
    const tooltipBg = isDark ? "#18181b" : "#ffffff"
    const tooltipBorder = isDark ? "#3f3f46" : "#e5e7eb"

    const hasBreast = data.some(d => d.breastMin > 0)
    const hasBottle = data.some(d => d.bottleMl > 0)

    return (
        <StatsCard>
            <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-3">7日間の推移</p>
            {!hasAny ? (
                <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-8">記録がありません</p>
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <ComposedChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: textColor }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            yAxisId="count"
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: textColor }}
                            axisLine={false}
                            tickLine={false}
                            width={24}
                        />
                        {(hasBreast || hasBottle) && (
                            <YAxis
                                yAxisId="amount"
                                orientation="right"
                                tick={{ fontSize: 11, fill: textColor }}
                                axisLine={false}
                                tickLine={false}
                                width={32}
                            />
                        )}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: tooltipBg,
                                border: `1px solid ${tooltipBorder}`,
                                borderRadius: "8px",
                                fontSize: "12px",
                            }}
                            formatter={(value, name) => {
                                const v = value as number
                                if (name === "回数") return [`${v}回`, name]
                                if (name === "母乳(分)") return [`${v}分`, name]
                                if (name === "ミルク(ml)") return [`${v}ml`, name]
                                return [v, name as string]
                            }}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                        />
                        <Bar
                            yAxisId="count"
                            dataKey="count"
                            name="回数"
                            fill={isDark ? "#fb7185" : "#f43f5e"}
                            radius={[3, 3, 0, 0]}
                            maxBarSize={32}
                        />
                        {hasBreast && (
                            <Line
                                yAxisId="amount"
                                dataKey="breastMin"
                                name="母乳(分)"
                                stroke={isDark ? "#818cf8" : "#6366f1"}
                                dot={false}
                                strokeWidth={2}
                            />
                        )}
                        {hasBottle && (
                            <Line
                                yAxisId="amount"
                                dataKey="bottleMl"
                                name="ミルク(ml)"
                                stroke={isDark ? "#fbbf24" : "#f59e0b"}
                                dot={false}
                                strokeWidth={2}
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            )}
        </StatsCard>
    )
}
