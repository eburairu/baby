"use client"

import { useMemo, useEffect, useState } from "react"
import { BabyRecord } from "@/types/record"
import { useShelfRecords } from "@/hooks/useShelfRecords"
import { RECORD_TYPE_HEX_COLORS } from "@/constants/ui"
import { hexVertices, hexPolygonPoints } from "@/lib/hexagonUtils"

// ミニ瓶の寸法定数（物理・描画共通）
const MINI_W = 68
const MINI_H = 96
const MINI_WALL = 6
const MINI_NECK_H = 10
const HEX_R = 5
const DAYS_BACK = 13

// --- 物理レイアウト計算 ---

interface PhysicsToken {
    id: number
    type: BabyRecord["type"]
    x: number
    y: number
    angle: number
}

function seededRng(seed: number) {
    let s = seed >>> 0
    return () => {
        s = Math.imul(s, 1664525) + 1013904223
        return (s >>> 0) / 0x100000000
    }
}

async function computePhysicsLayout(records: BabyRecord[]): Promise<PhysicsToken[]> {
    if (records.length === 0) return []

    const Matter = await import("matter-js")
    const decomp = await import("poly-decomp")
    Matter.Common.setDecomp(decomp.default ?? decomp)

    const engine = Matter.Engine.create({ gravity: { y: 1.5 } })
    const wallOpts = { isStatic: true, friction: 0.5, restitution: 0.05 }
    const innerW = MINI_W - MINI_WALL * 2

    Matter.Composite.add(engine.world, [
        Matter.Bodies.rectangle(MINI_WALL / 2, MINI_H / 2, MINI_WALL, MINI_H, wallOpts),
        Matter.Bodies.rectangle(MINI_W - MINI_WALL / 2, MINI_H / 2, MINI_WALL, MINI_H, wallOpts),
        Matter.Bodies.rectangle(MINI_W / 2, MINI_H - MINI_WALL / 2, MINI_W, MINI_WALL, wallOpts),
    ])

    const rng = seededRng(records.reduce((acc, r) => acc + r.id, 42))
    const hexVerts = hexVertices(HEX_R)
    const bodyToRecord = new Map<number, BabyRecord>()

    const sorted = [...records].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    for (const record of sorted) {
        const x = MINI_WALL + HEX_R + rng() * (innerW - HEX_R * 2)
        const y = MINI_NECK_H + HEX_R
        const body = Matter.Bodies.fromVertices(x, y, [hexVerts], {
            restitution: 0.08,
            friction: 0.6,
            density: 0.004,
            frictionAir: 0.12,
        }, true)
        Matter.Body.setPosition(body, { x, y })
        Matter.Composite.add(engine.world, body)
        bodyToRecord.set(body.id, record)
    }

    const dt = 1000 / 60
    for (let i = 0; i < 250; i++) {
        Matter.Engine.update(engine, dt)
    }

    const result: PhysicsToken[] = []
    for (const body of Matter.Composite.allBodies(engine.world)) {
        if (body.isStatic) continue
        const record = bodyToRecord.get(body.id)
        if (record) {
            result.push({
                id: record.id,
                type: record.type,
                x: body.position.x,
                y: body.position.y,
                angle: body.angle,
            })
        }
    }

    Matter.Engine.clear(engine)
    return result
}


// --- ミニ瓶 SVG ビジュアル ---

function MiniJarVisual({ selected }: { selected: boolean }) {
    const w = MINI_W
    const h = MINI_H
    const neckW = 22
    const neckX = (w - neckW) / 2
    const r = 4

    const path = [
        `M ${neckX} ${MINI_NECK_H}`,
        `L ${neckX} 2`,
        `Q ${neckX} 0 ${neckX + 2} 0`,
        `L ${neckX + neckW - 2} 0`,
        `Q ${neckX + neckW} 0 ${neckX + neckW} 2`,
        `L ${neckX + neckW} ${MINI_NECK_H}`,
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
    const fill   = selected ? "rgba(199,210,254,0.18)" : "rgba(186,230,253,0.1)"

    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
            <path d={path} fill={fill} stroke={stroke} strokeWidth={selected ? 1.5 : 1} />
            <rect x={0} y={MINI_NECK_H} width={MINI_WALL} height={h - MINI_NECK_H} fill="rgba(186,230,253,0.08)" />
            <rect x={w - MINI_WALL} y={MINI_NECK_H} width={MINI_WALL} height={h - MINI_NECK_H} fill="rgba(186,230,253,0.08)" />
            <rect x={0} y={h - MINI_WALL} width={w} height={MINI_WALL} fill="rgba(186,230,253,0.08)" />
            <rect x={3} y={MINI_NECK_H + 4} width={2} height={h - MINI_NECK_H - 8} rx={1} fill="rgba(255,255,255,0.18)" />
        </svg>
    )
}

// --- JarThumbnail ---

interface JarThumbnailProps {
    date: Date
    records: BabyRecord[]
    selected: boolean
    onClick: () => void
}

function JarThumbnail({ date, records, selected, onClick }: JarThumbnailProps) {
    const [tokens, setTokens] = useState<PhysicsToken[] | null>(null)

    const recordKey = records.map(r => r.id).sort().join(",")

    useEffect(() => {
        let cancelled = false
        computePhysicsLayout(records).then(result => {
            if (!cancelled) setTokens(result)
        })
        return () => { cancelled = true }
        // recordKey で変化を検知する
    }, [recordKey]) // eslint-disable-line react-hooks/exhaustive-deps

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
                selected ? "scale-105" : "hover:scale-105 active:scale-95",
            ].join(" ")}
            aria-pressed={selected}
            aria-label={`${date.getMonth() + 1}月${date.getDate()}日の記録を見る`}
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
                    {tokens?.map(token => (
                        <polygon
                            key={token.id}
                            points={hexPolygonPoints(token.x, token.y, HEX_R, token.angle)}
                            fill={RECORD_TYPE_HEX_COLORS[token.type] ?? "#9ca3af"}
                            fillOpacity={0.88}
                            stroke={RECORD_TYPE_HEX_COLORS[token.type] ?? "#9ca3af"}
                            strokeOpacity={0.5}
                            strokeWidth={0.8}
                        />
                    ))}
                    {tokens === null && records.length > 0 && (
                        <text x={MINI_W / 2} y={MINI_H / 2 + 4} textAnchor="middle" fontSize={9} fill="rgba(147,197,253,0.6)">…</text>
                    )}
                </svg>

                {records.length === 0 && (
                    <div
                        style={{
                            position: "absolute", inset: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            paddingTop: MINI_NECK_H,
                        }}
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

// --- JarShelf ---

interface JarShelfProps {
    babyId: string
    selectedDate: Date
    onDateChange: (date: Date) => void
}

export function JarShelf({ babyId, selectedDate, onDateChange }: JarShelfProps) {
    const { records } = useShelfRecords(babyId, DAYS_BACK)

    const dates = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return Array.from({ length: DAYS_BACK + 1 }, (_, i) => {
            const d = new Date(today)
            d.setDate(today.getDate() - i)
            return d
        })
    }, [])

    const recordsByKey = useMemo(() => {
        const map = new Map<string, BabyRecord[]>()
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
                style={{ scrollbarWidth: "none" } as React.CSSProperties}
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
            <div className="h-[2px] mx-3 rounded-full bg-gradient-to-r from-transparent via-sky-300/40 dark:via-sky-700/30 to-transparent" />
        </div>
    )
}
