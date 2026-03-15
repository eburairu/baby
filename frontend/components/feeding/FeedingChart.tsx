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
import { formatDateLocal } from "@/lib/dateUtils"
import { StatsCard } from "@/components/ui/stats-card"
import { ChartViewToggle } from "@/components/charts/ChartViewToggle"
import { RhythmChartView } from "@/components/charts/RhythmChartView"
import { calculateDailyStats, normalizeFeedingFromEntity, buildFeedingHourlyComparison } from "@/lib/feedingUtils"
import { buildRhythmData, calcMedianIntervalMin } from "@/lib/rhythmUtils"
import type { Feeding } from "@/types/feeding"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { getChartGridColor, getChartTextColor, getChartTooltipStyle } from "@/components/charts/ChartStyles"
import { DayComparisonChart } from "@/components/charts/DayComparisonChart"

const CHART_HEIGHT = 200
const MIN_RECORDS_FOR_PREDICTION = 5

type CompareMetric = "count" | "ml" | "min"

const COMPARE_METRICS: { key: CompareMetric; label: string; unit: string }[] = [
    { key: "count", label: "回数", unit: "回" },
    { key: "ml",    label: "ミルク量", unit: "ml" },
    { key: "min",   label: "授乳時間", unit: "分" },
]

interface FeedingChartProps {
    feedings: Feeding[]
}

export function FeedingChart({ feedings }: FeedingChartProps) {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    const [view, setView] = useLocalStorage<"trend" | "rhythm" | "compare">("feeding-chart-view", "trend")
    const [compareMetric, setCompareMetric] = useLocalStorage<CompareMetric>("feeding-compare-metric", "count")

    // 推移ビュー用データ
    const trendData = useMemo(() => {
        const normalized = feedings.map(normalizeFeedingFromEntity)
        return calculateDailyStats(normalized, 7)
    }, [feedings])

    const hasAny = trendData.some(d => d.count > 0)

    // リズムビュー用データ
    const { breastPoints, bottlePoints, medianIntervalMin, lastTimestamp } = useMemo(() => {
        const todayStr = formatDateLocal(new Date())
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

    // 比較ビュー用データ
    const feedingHourlyData = useMemo(() => {
        if (view !== "compare") return []
        const normalized = feedings.map(normalizeFeedingFromEntity)
        return buildFeedingHourlyComparison(normalized)
    }, [feedings, view])

    const compareData = useMemo(() => {
        return feedingHourlyData.map(p => {
            if (compareMetric === "ml")  return { hour: p.hour, today: p.todayMl,    avg7: p.avg7Ml }
            if (compareMetric === "min") return { hour: p.hour, today: p.todayMin,   avg7: p.avg7Min }
            return                              { hour: p.hour, today: p.todayCount, avg7: p.avg7Count }
        })
    }, [feedingHourlyData, compareMetric])

    const gridColor = getChartGridColor(isDark)
    const textColor = getChartTextColor(isDark)

    const hasBreast = trendData.some(d => d.breastMin > 0)
    const hasBottle = trendData.some(d => d.bottleMl > 0)

    const currentMetric = COMPARE_METRICS.find(m => m.key === compareMetric) ?? COMPARE_METRICS[0]

    return (
        <StatsCard>
            <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                    {view === "trend" ? "7日間の推移" : view === "rhythm" ? "生活リズム（過去7日）" : "今日 vs 7日平均"}
                </p>
                <ChartViewToggle view={view} onChange={setView} />
            </div>

            {view === "compare" ? (
                <>
                    <div className="mb-3 flex gap-1">
                        {COMPARE_METRICS.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setCompareMetric(key)}
                                aria-pressed={compareMetric === key}
                                className={[
                                    "rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-zinc-900",
                                    compareMetric === key
                                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                                        : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200",
                                ].join(" ")}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <DayComparisonChart
                        data={compareData}
                        colorToday={isDark ? "#fb7185" : "#f43f5e"}
                        currentHour={(new Date().getUTCHours() + 9) % 24}
                        unit={currentMetric.unit}
                    />
                </>
            ) : view === "trend" ? (
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
                                contentStyle={getChartTooltipStyle(isDark)}
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
                                    stroke={isDark ? "#60a5fa" : "#3b82f6"}
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
                        { data: bottlePoints, fill: isDark ? "#60a5fa" : "#3b82f6", name: "ミルク", shape: "drop" },
                    ]}
                    medianIntervalMin={medianIntervalMin}
                    lastTimestampISO={lastTimestamp}
                    height={CHART_HEIGHT}
                />
            )}
        </StatsCard>
    )
}
