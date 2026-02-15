"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ContractionRecord } from "@/types/contraction"
import { prepareGraphData } from "@/lib/contractionUtils"

interface ContractionGraphProps {
    contractions: ContractionRecord[]
}

const W = 400
const H = 200
const M = { top: 10, right: 10, bottom: 40, left: 45 }
const chartW = W - M.left - M.right
const chartH = H - M.top - M.bottom

function formatHHMM(isoString: string): string {
    const d = new Date(isoString)
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function formatSeconds(s: number): string {
    const m = Math.floor(s / 60)
    const sec = s % 60
    if (m > 0) return `${m}分${sec}秒`
    return `${sec}秒`
}

export default function ContractionGraph({ contractions }: ContractionGraphProps) {
    const data = useMemo(() => prepareGraphData(contractions), [contractions])

    const maxValue = useMemo(() => {
        let max = 60
        for (const c of data) {
            if (c.duration_seconds != null && c.duration_seconds > max) max = c.duration_seconds
            if (c.interval_seconds != null && c.interval_seconds > max) max = c.interval_seconds
        }
        return max
    }, [data])

    const barGroupWidth = chartW / data.length
    const barWidth = Math.max(4, (barGroupWidth - 8) / 2)

    const scaleY = (val: number) => chartH - (val / maxValue) * chartH

    // Y軸の目盛り（0, 1/4, 1/2, 3/4, max）
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(maxValue * ratio))

    return (
        <Card className="dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
            <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium dark:text-zinc-100">陣痛推移グラフ（直近10件）</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1 dark:text-zinc-400">
                        <span className="inline-block w-3 h-3 rounded-sm bg-red-400" />
                        持続時間
                    </span>
                    <span className="flex items-center gap-1 dark:text-zinc-400">
                        <span className="inline-block w-3 h-3 rounded-sm bg-blue-400" />
                        間隔
                    </span>
                </div>
                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    width="100%"
                    aria-label="陣痛推移グラフ"
                >
                    <g transform={`translate(${M.left},${M.top})`}>
                        {/* Y軸目盛り */}
                        {yTicks.map((tick) => {
                            const y = scaleY(tick)
                            return (
                                <g key={tick}>
                                    <line
                                        x1={0} y1={y}
                                        x2={chartW} y2={y}
                                        stroke="currentColor"
                                        className="text-gray-200 dark:text-zinc-800"
                                        strokeWidth={1}
                                    />
                                    <text
                                        x={-4} y={y}
                                        textAnchor="end"
                                        dominantBaseline="middle"
                                        fontSize={9}
                                        className="fill-gray-400 dark:fill-zinc-500"
                                    >
                                        {tick}s
                                    </text>
                                </g>
                            )
                        })}

                        {/* バーと X軸ラベル */}
                        {data.map((c, i) => {
                            const cx = i * barGroupWidth + barGroupWidth / 2
                            const durationH = c.duration_seconds != null
                                ? (c.duration_seconds / maxValue) * chartH
                                : 0
                            const intervalH = c.interval_seconds != null
                                ? (c.interval_seconds / maxValue) * chartH
                                : 0

                            return (
                                <g key={c.id}>
                                    {/* 持続時間バー（赤） */}
                                    {c.duration_seconds != null && (
                                        <rect
                                            x={cx - barWidth - 1}
                                            y={chartH - durationH}
                                            width={barWidth}
                                            height={durationH}
                                            fill="#f87171"
                                            rx={2}
                                        >
                                            <title>{formatSeconds(c.duration_seconds)}</title>
                                        </rect>
                                    )}

                                    {/* 間隔バー（青）— 2件目以降のみ */}
                                    {i > 0 && c.interval_seconds != null && (
                                        <rect
                                            x={cx + 1}
                                            y={chartH - intervalH}
                                            width={barWidth}
                                            height={intervalH}
                                            fill="#60a5fa"
                                            rx={2}
                                        >
                                            <title>{formatSeconds(c.interval_seconds)}</title>
                                        </rect>
                                    )}

                                    {/* X軸ラベル */}
                                    <text
                                        x={cx}
                                        y={chartH + 12}
                                        textAnchor="middle"
                                        fontSize={9}
                                        className="fill-gray-400 dark:fill-zinc-500"
                                    >
                                        {formatHHMM(c.start_time)}
                                    </text>
                                </g>
                            )
                        })}

                        {/* X軸ライン */}
                        <line
                            x1={0} y1={chartH}
                            x2={chartW} y2={chartH}
                            className="stroke-gray-300 dark:stroke-zinc-700"
                            strokeWidth={1}
                        />
                    </g>
                </svg>
            </CardContent>
        </Card>
    )
}
