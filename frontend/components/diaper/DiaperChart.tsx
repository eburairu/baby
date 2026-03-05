"use client"
import {
    BarChart,
    Bar,
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
import { calculateDailyDiaperStats, normalizeDiaperFromEntity } from "@/lib/diaperUtils"
import type { Diaper } from "@/types/diaper"

interface DiaperChartProps {
    diapers: Diaper[]
}

export function DiaperChart({ diapers }: DiaperChartProps) {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    const data = useMemo(() => {
        const normalized = diapers.map(normalizeDiaperFromEntity)
        return calculateDailyDiaperStats(normalized, 7)
    }, [diapers])

    const hasAny = data.some(d => d.wet > 0 || d.dirty > 0)

    const gridColor = isDark ? "#3f3f46" : "#e5e7eb"
    const textColor = isDark ? "#a1a1aa" : "#6b7280"
    const tooltipBg = isDark ? "#18181b" : "#ffffff"
    const tooltipBorder = isDark ? "#3f3f46" : "#e5e7eb"

    return (
        <StatsCard>
            <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-3">7日間の推移</p>
            {!hasAny ? (
                <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-8">記録がありません</p>
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: textColor }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: textColor }}
                            axisLine={false}
                            tickLine={false}
                            width={24}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: tooltipBg,
                                border: `1px solid ${tooltipBorder}`,
                                borderRadius: "8px",
                                fontSize: "12px",
                            }}
                            formatter={(value, name) => {
                                const v = value as number
                                return [`${v}回`, name as string]
                            }}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                        />
                        <Bar
                            dataKey="wet"
                            name="おしっこ"
                            fill={isDark ? "#38bdf8" : "#0ea5e9"}
                            radius={[3, 3, 0, 0]}
                            maxBarSize={32}
                        />
                        <Bar
                            dataKey="dirty"
                            name="うんち"
                            fill={isDark ? "#fb923c" : "#f97316"}
                            radius={[3, 3, 0, 0]}
                            maxBarSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </StatsCard>
    )
}
