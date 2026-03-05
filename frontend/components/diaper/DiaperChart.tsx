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
import { useMemo, useState } from "react"
import { format } from "date-fns"
import { StatsCard } from "@/components/ui/stats-card"
import { ChartViewToggle } from "@/components/charts/ChartViewToggle"
import { RhythmChartView } from "@/components/charts/RhythmChartView"
import { calculateDailyDiaperStats, normalizeDiaperFromEntity } from "@/lib/diaperUtils"
import { buildRhythmData, calcMedianIntervalMin } from "@/lib/rhythmUtils"
import type { Diaper } from "@/types/diaper"

const CHART_HEIGHT = 200
const MIN_RECORDS_FOR_PREDICTION = 5

interface DiaperChartProps {
    diapers: Diaper[]
}

export function DiaperChart({ diapers }: DiaperChartProps) {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    const [view, setView] = useState<"trend" | "rhythm">(() => {
        if (typeof window === "undefined") return "trend"
        return (localStorage.getItem("diaper-chart-view") as "trend" | "rhythm") ?? "trend"
    })

    const handleViewChange = (v: "trend" | "rhythm") => {
        setView(v)
        localStorage.setItem("diaper-chart-view", v)
    }

    // 推移ビュー用データ
    const trendData = useMemo(() => {
        const normalized = diapers.map(normalizeDiaperFromEntity)
        return calculateDailyDiaperStats(normalized, 7)
    }, [diapers])

    const hasAny = trendData.some(d => d.wet > 0 || d.dirty > 0)

    // リズムビュー用データ
    const { wetPoints, dirtyPoints, medianIntervalMin, lastTimestamp } = useMemo(() => {
        const todayStr = format(new Date(), "yyyy-MM-dd")
        const normalized = diapers.map(normalizeDiaperFromEntity)
        const timestamps = normalized.map(d => d.timestamp)

        const wetItems = normalized
            .filter(d => d.type === "WET" || d.type === "BOTH")
            .map(d => ({
                timestamp: d.timestamp,
                label: d.type === "BOTH" ? "おしっこ+うんち" : "おしっこ",
            }))
        const dirtyItems = normalized
            .filter(d => d.type === "DIRTY" || d.type === "BOTH")
            .map(d => ({
                timestamp: d.timestamp,
                label: d.type === "BOTH" ? "おしっこ+うんち" : "うんち",
            }))

        return {
            wetPoints: buildRhythmData(wetItems, todayStr),
            dirtyPoints: buildRhythmData(dirtyItems, todayStr),
            medianIntervalMin: timestamps.length >= MIN_RECORDS_FOR_PREDICTION
                ? calcMedianIntervalMin(timestamps)
                : null,
            lastTimestamp: diapers[0]?.change_time ?? null,
        }
    }, [diapers])

    const gridColor = isDark ? "#3f3f46" : "#e5e7eb"
    const textColor = isDark ? "#a1a1aa" : "#6b7280"
    const tooltipBg = isDark ? "#18181b" : "#ffffff"
    const tooltipBorder = isDark ? "#3f3f46" : "#e5e7eb"

    return (
        <StatsCard>
            <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                    {view === "trend" ? "7日間の推移" : "生活リズム（過去7日）"}
                </p>
                <ChartViewToggle view={view} onChange={handleViewChange} />
            </div>

            {view === "trend" ? (
                !hasAny ? (
                    <p className="py-8 text-center text-sm text-gray-400 dark:text-zinc-500">記録がありません</p>
                ) : (
                    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                        <BarChart data={trendData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
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
                            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
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
                )
            ) : (
                <RhythmChartView
                    groups={[
                        { data: wetPoints, fill: isDark ? "#38bdf8" : "#0ea5e9", name: "おしっこ", shape: "drop" },
                        { data: dirtyPoints, fill: isDark ? "#fb923c" : "#f97316", name: "うんち", shape: "triangle" },
                    ]}
                    medianIntervalMin={medianIntervalMin}
                    lastTimestampISO={lastTimestamp}
                    height={CHART_HEIGHT}
                />
            )}
        </StatsCard>
    )
}
