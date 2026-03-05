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
import { useMemo, useState } from "react"
import { format } from "date-fns"
import { StatsCard } from "@/components/ui/stats-card"
import { ChartViewToggle } from "@/components/charts/ChartViewToggle"
import { RhythmChartView } from "@/components/charts/RhythmChartView"
import { calculateDailyStats, normalizeFeedingFromEntity } from "@/lib/feedingUtils"
import { buildRhythmData, calcMedianIntervalMin } from "@/lib/rhythmUtils"
import type { Feeding } from "@/types/feeding"

const CHART_HEIGHT = 200
const MIN_RECORDS_FOR_PREDICTION = 5

interface FeedingChartProps {
    feedings: Feeding[]
}

export function FeedingChart({ feedings }: FeedingChartProps) {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    const [view, setView] = useState<"trend" | "rhythm">(() => {
        if (typeof window === "undefined") return "trend"
        return (localStorage.getItem("feeding-chart-view") as "trend" | "rhythm") ?? "trend"
    })

    const handleViewChange = (v: "trend" | "rhythm") => {
        setView(v)
        localStorage.setItem("feeding-chart-view", v)
    }

    // 推移ビュー用データ
    const trendData = useMemo(() => {
        const normalized = feedings.map(normalizeFeedingFromEntity)
        return calculateDailyStats(normalized, 7)
    }, [feedings])

    const hasAny = trendData.some(d => d.count > 0)

    // リズムビュー用データ
    const { breastPoints, bottlePoints, medianIntervalMin, lastTimestamp } = useMemo(() => {
        const todayStr = format(new Date(), "yyyy-MM-dd")
        const normalized = feedings.map(normalizeFeedingFromEntity)
        const timestamps = normalized.map(f => f.timestamp)

        const breastItems = normalized
            .filter(f => f.type === "BREAST" || f.type === "MIXED")
            .map(f => ({ timestamp: f.timestamp, label: "母乳" }))
        const bottleItems = normalized
            .filter(f => f.type === "BOTTLE" || f.type === "MIXED")
            .map(f => ({
                timestamp: f.timestamp,
                label: f.amount > 0 ? `ミルク ${f.amount}ml` : "ミルク",
            }))

        return {
            breastPoints: buildRhythmData(breastItems, todayStr),
            bottlePoints: buildRhythmData(bottleItems, todayStr),
            medianIntervalMin: timestamps.length >= MIN_RECORDS_FOR_PREDICTION
                ? calcMedianIntervalMin(timestamps)
                : null,
            lastTimestamp: feedings[0]?.feeding_time ?? null,
        }
    }, [feedings])

    const gridColor = isDark ? "#3f3f46" : "#e5e7eb"
    const textColor = isDark ? "#a1a1aa" : "#6b7280"
    const tooltipBg = isDark ? "#18181b" : "#ffffff"
    const tooltipBorder = isDark ? "#3f3f46" : "#e5e7eb"

    const hasBreast = trendData.some(d => d.breastMin > 0)
    const hasBottle = trendData.some(d => d.bottleMl > 0)

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
                        <ComposedChart data={trendData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
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
                            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
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
                )
            ) : (
                <RhythmChartView
                    groups={[
                        { data: breastPoints, fill: isDark ? "#fb7185" : "#f43f5e", name: "母乳", shape: "heart" },
                        { data: bottlePoints, fill: isDark ? "#fbbf24" : "#f59e0b", name: "ミルク", shape: "drop" },
                    ]}
                    medianIntervalMin={medianIntervalMin}
                    lastTimestampISO={lastTimestamp}
                    height={CHART_HEIGHT}
                />
            )}
        </StatsCard>
    )
}
