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
import { formatDateLocal } from "@/lib/dateUtils"
import { StatsCard } from "@/components/ui/stats-card"
import { ChartViewToggle, getChartViewTitle } from "@/components/charts/ChartViewToggle"
import { RhythmChartView } from "@/components/charts/RhythmChartView"
import { calculateDailyDiaperStats, normalizeDiaperFromEntity } from "@/lib/diaperUtils"
import { buildRhythmData, calcMedianIntervalMin } from "@/lib/rhythmUtils"
import type { Diaper } from "@/types/diaper"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { getChartGridColor, getChartTextColor, getChartTooltipStyle } from "@/components/charts/ChartStyles"
import { DayComparisonChart } from "@/components/charts/DayComparisonChart"
import { buildDiaperHourlyComparison } from "@/lib/diaperUtils"

const CHART_HEIGHT = 200
const MIN_RECORDS_FOR_PREDICTION = 5

interface DiaperChartProps {
    diapers: Diaper[]
}

export function DiaperChart({ diapers }: DiaperChartProps) {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    const [view, setView] = useLocalStorage<"trend" | "rhythm" | "compare">("diaper-chart-view", "trend")

    // 推移ビュー用データ
    const trendData = useMemo(() => {
        const normalized = diapers.map(normalizeDiaperFromEntity)
        return calculateDailyDiaperStats(normalized, 7)
    }, [diapers])

    const hasAny = trendData.some(d => d.wet > 0 || d.dirty > 0)

    // リズムビュー用データ
    const { wetPoints, dirtyPoints, medianIntervalMin, lastTimestamp } = useMemo(() => {
        const todayStr = formatDateLocal(new Date())
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

    // 比較ビュー用データ
    const compareData = useMemo(() => {
        if (view !== "compare") return []
        const normalized = diapers.map(normalizeDiaperFromEntity)
        return buildDiaperHourlyComparison(normalized)
    }, [diapers, view])

    const gridColor = getChartGridColor(isDark)
    const textColor = getChartTextColor(isDark)

    return (
        <StatsCard>
            <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                    {getChartViewTitle(view)}
                </p>
                <ChartViewToggle view={view} onChange={setView} />
            </div>

            {view === "compare" ? (
                <DayComparisonChart
                    data={compareData}
                    colorToday={isDark ? "#fb923c" : "#f97316"}
                    currentHour={(new Date().getUTCHours() + 9) % 24}
                />
            ) : view === "trend" ? (
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
                                contentStyle={getChartTooltipStyle(isDark)}
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
