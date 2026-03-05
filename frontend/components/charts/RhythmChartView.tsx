"use client"
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts"
import { useTheme } from "next-themes"
import type { RhythmPoint } from "@/lib/rhythmUtils"

interface RhythmChartViewProps {
    /** 色ごとにグループ化されたデータ */
    groups: { data: RhythmPoint[]; fill: string; name?: string }[]
    medianIntervalMin: number | null
    lastTimestampISO: string | null
    height?: number
}

function formatHour(minutes: number) {
    const h = Math.floor(minutes / 60)
    return `${h}:00`
}

function dayLabel(offset: number) {
    if (offset === 0) return "今日"
    if (offset === 1) return "昨日"
    return `${offset}日前`
}

interface TooltipPayloadItem {
    payload: RhythmPoint
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
    if (!active || !payload?.length) return null
    const point = payload[0]?.payload
    if (!point) return null
    const h = Math.floor(point.timeMinutes / 60).toString().padStart(2, "0")
    const m = (point.timeMinutes % 60).toString().padStart(2, "0")
    return (
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md dark:border-zinc-700 dark:bg-zinc-800">
            <p className="font-medium text-gray-700 dark:text-zinc-200">{dayLabel(point.dayOffset)} {h}:{m}</p>
            <p className="text-gray-500 dark:text-zinc-400">{point.label}</p>
        </div>
    )
}

export function RhythmChartView({
    groups,
    medianIntervalMin,
    lastTimestampISO,
    height = 200,
}: RhythmChartViewProps) {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    const hasAny = groups.some(g => g.data.length > 0)

    const gridColor = isDark ? "#3f3f46" : "#e5e7eb"
    const textColor = isDark ? "#a1a1aa" : "#6b7280"

    // 予測ライン: 最終記録時刻 + 中央値間隔
    let predictionMinutes: number | null = null
    if (lastTimestampISO && medianIntervalMin !== null) {
        const last = new Date(lastTimestampISO)
        const predMs = last.getTime() + medianIntervalMin * 60 * 1000
        const pred = new Date(predMs)
        predictionMinutes = pred.getUTCHours() * 60 + pred.getUTCMinutes()
    }

    const xTicks = [0, 360, 720, 1080, 1440]

    if (!hasAny) {
        return (
            <p className="py-8 text-center text-sm text-gray-400 dark:text-zinc-500">記録がありません</p>
        )
    }

    return (
        <div>
            {medianIntervalMin !== null && (
                <p className="mb-2 text-[10px] text-gray-400 dark:text-zinc-500">
                    平均間隔: 約{Math.round(medianIntervalMin / 60 * 10) / 10}時間
                </p>
            )}
            <ResponsiveContainer width="100%" height={height}>
                <ScatterChart margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                        type="number"
                        dataKey="timeMinutes"
                        domain={[0, 1440]}
                        ticks={xTicks}
                        tickFormatter={formatHour}
                        tick={{ fontSize: 10, fill: textColor }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        type="number"
                        dataKey="dayOffset"
                        domain={[-0.5, 6.5]}
                        ticks={[0, 1, 2, 3, 4, 5, 6]}
                        tickFormatter={dayLabel}
                        tick={{ fontSize: 10, fill: textColor }}
                        axisLine={false}
                        tickLine={false}
                        width={36}
                        reversed
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {predictionMinutes !== null && (
                        <ReferenceLine
                            x={predictionMinutes}
                            stroke={isDark ? "#a78bfa" : "#8b5cf6"}
                            strokeDasharray="4 4"
                            strokeWidth={1.5}
                            label={{
                                value: "予測",
                                position: "insideTopRight",
                                fontSize: 9,
                                fill: isDark ? "#a78bfa" : "#8b5cf6",
                            }}
                        />
                    )}
                    {groups.map((g, i) => (
                        <Scatter
                            key={i}
                            name={g.name}
                            data={g.data}
                            fill={g.fill}
                            opacity={0.8}
                            r={4}
                        />
                    ))}
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    )
}
