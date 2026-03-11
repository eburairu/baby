"use client"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine,
} from "recharts"
import { useTheme } from "next-themes"
import { getChartGridColor, getChartTextColor, getChartTooltipStyle } from "@/components/charts/ChartStyles"
import type { HourlyPoint } from "@/lib/feedingUtils"

const CHART_HEIGHT = 200

interface Props {
    data: HourlyPoint[]
    colorToday: string
    currentHour: number
}

export function DayComparisonChart({ data, colorToday, currentHour }: Props) {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    const gridColor = getChartGridColor(isDark)
    const textColor = getChartTextColor(isDark)

    const todayNow = data[currentHour]?.today ?? 0
    const avgNow = data[currentHour]?.avg7 ?? 0
    const diff = todayNow - avgNow

    let badgeText: string
    let badgeClass: string
    if (Math.abs(diff) < 0.5) {
        badgeText = "7日平均とほぼ同じ"
        badgeClass = "bg-gray-100 text-gray-600 dark:bg-zinc-700 dark:text-zinc-300"
    } else if (diff > 0) {
        badgeText = `7日平均より +${diff.toFixed(1)}回`
        badgeClass = "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
    } else {
        badgeText = `7日平均より ${diff.toFixed(1)}回`
        badgeClass = "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
    }

    return (
        <div>
            <div className="mb-3">
                <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${badgeClass}`}>
                    {badgeText}
                </span>
            </div>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 11, fill: textColor }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(h: number) => h % 4 === 0 ? `${h}時` : ""}
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
                        labelFormatter={(h) => `${h}時`}
                        formatter={(value, name) => [
                            name === "今日" ? `${value}回` : `${Number(value).toFixed(1)}回`,
                            name as string,
                        ]}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <ReferenceLine
                        x={currentHour}
                        stroke="#9ca3af"
                        strokeDasharray="3 3"
                        label={{ value: "今", position: "top", fontSize: 10, fill: textColor }}
                    />
                    <Line
                        dataKey="today"
                        name="今日"
                        stroke={colorToday}
                        strokeWidth={2}
                        dot={false}
                    />
                    <Line
                        dataKey="avg7"
                        name="7日平均"
                        stroke={gridColor}
                        strokeDasharray="4 2"
                        strokeWidth={1.5}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
