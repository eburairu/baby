"use client"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Temperature, FEVER_THRESHOLD, HIGH_FEVER_THRESHOLD, getFeverStatus } from "@/types/temperature"
import { useMemo, useState } from "react"
import { useTheme } from "next-themes"
import { getChartGridColor, getChartTextColor, getChartTooltipStyle } from "@/components/charts/ChartStyles"
import { formatDateTime, formatTime, subtractDays } from "@/lib/dateUtils"

interface Props {
    temperatures: Temperature[]
}

type QuickRange = "1d" | "3d" | "7d" | "1m" | "all"

const QUICK_RANGES: { label: string; value: QuickRange }[] = [
    { label: "24h", value: "1d" },
    { label: "3日", value: "3d" },
    { label: "7日", value: "7d" },
    { label: "1ヶ月", value: "1m" },
    { label: "全期間", value: "all" },
]

function getStartTime(range: QuickRange, now: Date): Date | null {
    switch (range) {
        case "1d": return subtractDays(now, 1)
        case "3d": return subtractDays(now, 3)
        case "7d": return subtractDays(now, 7)
        case "1m": return subtractDays(now, 30)
        case "all": return null
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomDot(props: any) {
    const { cx, cy, payload } = props
    if (!payload || cx == null || cy == null) return null
    const status = getFeverStatus(payload.temperature)
    const fill = status === "high_fever" ? "#ef4444" : status === "fever" ? "#f97316" : "#10b981"
    return <circle cx={cx} cy={cy} r={4} fill={fill} stroke="white" strokeWidth={1.5} />
}

export function TemperatureChart({ temperatures }: Props) {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"
    const [range, setRange] = useState<QuickRange>("7d")

    const chartData = useMemo(() => {
        const now = new Date()
        const start = getStartTime(range, now)
        const filtered = start
            ? temperatures.filter((t) => new Date(t.measured_at) >= start)
            : temperatures

        return [...filtered]
            .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
            .map((t) => ({
                time: new Date(t.measured_at).getTime(),
                temperature: t.temperature,
            }))
    }, [temperatures, range])

    const tooltipStyle = getChartTooltipStyle(isDark)

    if (temperatures.length === 0) return null

    return (
        <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 mb-6 transition-colors">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                        体温の推移
                    </CardTitle>
                    <div className="flex gap-1 flex-wrap">
                        {QUICK_RANGES.map((r) => (
                            <Button
                                key={r.value}
                                variant={range === r.value ? "default" : "outline"}
                                size="sm"
                                className={`h-6 px-2 text-xs rounded-lg ${
                                    range === r.value
                                        ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                                        : ""
                                }`}
                                onClick={() => setRange(r.value)}
                            >
                                {r.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                        この期間の記録がありません
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={getChartGridColor(isDark)}
                                vertical={false}
                            />
                            <XAxis
                                dataKey="time"
                                type="number"
                                domain={["dataMin", "dataMax"]}
                                scale="time"
                                tickFormatter={(v) => formatDateTime(v)}
                                tick={{ fontSize: 10, fill: getChartTextColor(isDark) }}
                            />
                            <YAxis
                                domain={[35, "auto"]}
                                tickFormatter={(v) => `${v}`}
                                tick={{ fontSize: 10, fill: getChartTextColor(isDark) }}
                                width={32}
                            />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                labelFormatter={(v) => formatDateTime(v)}
                                formatter={(value) => value != null ? [`${(value as number).toFixed(1)}°C`, "体温"] : ["—", "体温"]}
                            />
                            <ReferenceLine
                                y={FEVER_THRESHOLD}
                                stroke="#f97316"
                                strokeDasharray="4 4"
                                label={{
                                    value: "発熱",
                                    position: "insideTopRight",
                                    fontSize: 10,
                                    fill: "#f97316",
                                }}
                            />
                            <ReferenceLine
                                y={HIGH_FEVER_THRESHOLD}
                                stroke="#ef4444"
                                strokeDasharray="4 4"
                                label={{
                                    value: "高熱",
                                    position: "insideTopRight",
                                    fontSize: 10,
                                    fill: "#ef4444",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="temperature"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={<CustomDot />}
                                activeDot={{ r: 6 }}
                                connectNulls
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
