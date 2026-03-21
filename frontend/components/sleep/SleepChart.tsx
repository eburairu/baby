"use client"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { useTheme } from "next-themes"
import { useMemo } from "react"
import { formatDateLocal, subtractDays, isSameDay, formatMonthDaySlash } from "@/lib/dateUtils"
import { StatsCard } from "@/components/ui/stats-card"
import { ChartViewToggle, getChartViewTitle } from "@/components/charts/ChartViewToggle"
import { RhythmChartView } from "@/components/charts/RhythmChartView"
import { buildRhythmData, calcMedianIntervalMin } from "@/lib/rhythmUtils"
import type { Sleep } from "@/types/sleep"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { getChartGridColor, getChartTextColor, getChartTooltipStyle } from "@/components/charts/ChartStyles"

const CHART_HEIGHT = 200
const MIN_RECORDS_FOR_PREDICTION = 5

interface SleepChartProps {
    sleeps: Sleep[]
}

interface DailySleepData {
    date: string
    count: number
    totalMin: number
}

function calculateDailySleepStats(sleeps: Sleep[], days = 7): DailySleepData[] {
    const today = new Date()
    return Array.from({ length: days }, (_, i) => {
        const day = subtractDays(today, days - 1 - i)
        const daySleeps = sleeps.filter(s => isSameDay(new Date(s.start_time), day))
        const totalMin = daySleeps.reduce((acc, s) => {
            if (!s.end_time) return acc
            const ms = new Date(s.end_time).getTime() - new Date(s.start_time).getTime()
            return acc + Math.floor(ms / 60000)
        }, 0)
        return {
            date: formatMonthDaySlash(day),
            count: daySleeps.length,
            totalMin,
        }
    })
}

export function SleepChart({ sleeps }: SleepChartProps) {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    const [view, setView] = useLocalStorage<"trend" | "rhythm" | "compare">("sleep-chart-view", "trend")

    // 推移ビュー用データ
    const trendData = useMemo(() => calculateDailySleepStats(sleeps, 7), [sleeps])
    const hasAny = trendData.some(d => d.count > 0)

    // リズムビュー用データ（睡眠開始時刻をプロット）
    const { rhythmPoints, medianIntervalMin, lastTimestamp } = useMemo(() => {
        const todayStr = formatDateLocal(new Date())
        const timestamps = sleeps.map(s => s.start_time)
        const items = sleeps.map(s => ({
            timestamp: s.start_time,
            label: "就寝",
        }))

        return {
            rhythmPoints: buildRhythmData(items, todayStr),
            medianIntervalMin: timestamps.length >= MIN_RECORDS_FOR_PREDICTION
                ? calcMedianIntervalMin(timestamps)
                : null,
            lastTimestamp: sleeps[0]?.start_time ?? null,
        }
    }, [sleeps])

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

            {view !== "rhythm" && view !== "compare" ? (
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
                                    if (name === "回数") return [`${v}回`, name]
                                    if (name === "合計(分)") return [`${v}分`, name]
                                    return [v, name as string]
                                }}
                            />
                            <Bar
                                dataKey="count"
                                name="回数"
                                fill={isDark ? "#818cf8" : "#6366f1"}
                                radius={[3, 3, 0, 0]}
                                maxBarSize={32}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )
            ) : (
                <RhythmChartView
                    groups={[
                        { data: rhythmPoints, fill: isDark ? "#818cf8" : "#6366f1", name: "就寝" },
                    ]}
                    medianIntervalMin={medianIntervalMin}
                    lastTimestampISO={lastTimestamp}
                    height={CHART_HEIGHT}
                />
            )}
        </StatsCard>
    )
}
