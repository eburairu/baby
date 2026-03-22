"use client"

import { useMemo } from "react"
import { BabyRecord } from "@/types/record"

// ミニ瓶のサイズ定数
const MINI_W = 68
const MINI_H = 96
const MINI_WALL = 6
const MINI_NECK_W = 22
const MINI_NECK_H = 10

const TYPE_DOT_COLORS: Record<string, string> = {
    feeding: "#f97316",   // orange-500
    sleep: "#6366f1",     // indigo-500
    diaper: "#f59e0b",    // amber-500
    growth: "#22c55e",    // green-500
    note: "#a855f7",      // purple-500
    contraction: "#f43f5e", // rose-500
}

// 線形合同法による再現性ある疑似乱数
function seededRng(seed: number) {
    let s = seed >>> 0
    return () => {
        s = Math.imul(s, 1664525) + 1013904223
        return (s >>> 0) / 0x100000000
    }
}

function calcDots(records: BabyRecord[]) {
    const rng = seededRng(records.reduce((acc, r) => acc + r.id, 42))
    const innerX = MINI_WALL + 2
    const innerW = MINI_W - MINI_WALL * 2 - 4
    const innerY = MINI_NECK_H + 2
    const innerH = MINI_H - MINI_NECK_H - MINI_WALL - 4
    return records.slice(0, 24).map(r => ({
        x: innerX + rng() * innerW,
        y: innerY + rng() * innerH,
        color: TYPE_DOT_COLORS[r.type] ?? "#9ca3af",
    }))
}

interface MiniJarVisualProps {
    selected: boolean
}

function MiniJarVisual({ selected }: MiniJarVisualProps) {
    const w = MINI_W
    const h = MINI_H
    const neckX = (w - MINI_NECK_W) / 2
    const r = 4

    const path = [
        `M ${neckX} ${MINI_NECK_H}`,
        `L ${neckX} 2`,
        `Q ${neckX} 0 ${neckX + 2} 0`,
        `L ${neckX + MINI_NECK_W - 2} 0`,
        `Q ${neckX + MINI_NECK_W} 0 ${neckX + MINI_NECK_W} 2`,
        `L ${neckX + MINI_NECK_W} ${MINI_NECK_H}`,
        `L ${w - r} ${MINI_NECK_H}`,
        `Q ${w} ${MINI_NECK_H} ${w} ${MINI_NECK_H + r}`,
        `L ${w} ${h - r}`,
        `Q ${w} ${h} ${w - r} ${h}`,
        `L ${r} ${h}`,
        `Q 0 ${h} 0 ${h - r}`,
        `L 0 ${MINI_NECK_H + r}`,
        `Q 0 ${MINI_NECK_H} ${r} ${MINI_NECK_H}`,
        "Z",
    ].join(" ")

    const stroke = selected ? "rgba(99,102,241,0.85)" : "rgba(147,197,253,0.5)"
    const fill = selected ? "rgba(199,210,254,0.18)" : "rgba(186,230,253,0.1)"
    const strokeW = selected ? 1.5 : 1

    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
            <path d={path} fill={fill} stroke={stroke} strokeWidth={strokeW} />
            <rect x={0} y={MINI_NECK_H} width={MINI_WALL} height={h - MINI_NECK_H} fill="rgba(186,230,253,0.08)" />
            <rect x={w - MINI_WALL} y={MINI_NECK_H} width={MINI_WALL} height={h - MINI_NECK_H} fill="rgba(186,230,253,0.08)" />
            <rect x={0} y={h - MINI_WALL} width={w} height={MINI_WALL} fill="rgba(186,230,253,0.08)" />
            <rect x={3} y={MINI_NECK_H + 4} width={2} height={h - MINI_NECK_H - 8} rx={1} fill="rgba(255,255,255,0.18)" />
        </svg>
    )
}

interface JarThumbnailProps {
    date: Date
    records: BabyRecord[]
    selected: boolean
    onClick: () => void
}

function JarThumbnail({ date, records, selected, onClick }: JarThumbnailProps) {
    const dots = useMemo(() => calcDots(records), [records])

    const label = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const diff = Math.round((today.getTime() - date.getTime()) / 86400000)
        if (diff === 0) return "今日"
        if (diff === 1) return "昨日"
        return `${date.getMonth() + 1}/${date.getDate()}`
    }, [date])

    return (
        <button
            onClick={onClick}
            className={[
                "flex flex-col items-center gap-1 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded",
                selected ? "scale-105" : "hover:scale-103 active:scale-95",
            ].join(" ")}
            aria-pressed={selected}
            title={`${date.getMonth() + 1}/${date.getDate()}の記録`}
        >
            <div style={{ position: "relative", width: MINI_W, height: MINI_H }}>
                <MiniJarVisual selected={selected} />
                <svg
                    width={MINI_W}
                    height={MINI_H}
                    style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
                    aria-hidden
                >
                    {dots.map((dot, i) => (
                        <circle key={i} cx={dot.x} cy={dot.y} r={2.5} fill={dot.color} fillOpacity={0.85} />
                    ))}
                </svg>
                {records.length === 0 && (
                    <div
                        style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: MINI_NECK_H }}
                        className="pointer-events-none"
                    >
                        <span className="text-[10px] text-gray-300 dark:text-zinc-600">空</span>
                    </div>
                )}
            </div>
            <span className={`text-[10px] font-medium leading-none tabular-nums ${selected ? "text-indigo-500 dark:text-indigo-400" : "text-gray-400 dark:text-zinc-500"}`}>
                {label}
            </span>
        </button>
    )
}

interface JarShelfProps {
    records: BabyRecord[] | undefined
    selectedDate: Date
    onDateChange: (date: Date) => void
    daysBack?: number
}

export function JarShelf({ records, selectedDate, onDateChange, daysBack = 13 }: JarShelfProps) {
    // 今日から daysBack 日前まで（新しい順: 今日が先頭）
    const dates = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return Array.from({ length: daysBack + 1 }, (_, i) => {
            const d = new Date(today)
            d.setDate(today.getDate() - i)
            return d
        })
    }, [daysBack])

    // records を日付キーでグループ化
    const recordsByKey = useMemo(() => {
        const map = new Map<string, BabyRecord[]>()
        if (!records) return map
        for (const r of records) {
            const t = new Date(r.timestamp)
            const key = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`
            const list = map.get(key)
            if (list) list.push(r)
            else map.set(key, [r])
        }
        return map
    }, [records])

    const selKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`

    return (
        <div className="w-full mt-3">
            <div
                className="flex gap-2.5 overflow-x-auto pb-3 px-3"
                style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
            >
                {dates.map(date => {
                    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
                    const dayRecords = recordsByKey.get(key) ?? []
                    return (
                        <div key={key} style={{ flexShrink: 0 }}>
                            <JarThumbnail
                                date={date}
                                records={dayRecords}
                                selected={key === selKey}
                                onClick={() => onDateChange(new Date(date))}
                            />
                        </div>
                    )
                })}
            </div>
            {/* 棚板 */}
            <div className="h-[2px] mx-3 rounded-full bg-gradient-to-r from-transparent via-sky-300/40 dark:via-sky-700/30 to-transparent" />
        </div>
    )
}
