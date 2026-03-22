"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { BabyRecord } from "@/types/record"
import { JarCanvasHandle, JAR_WIDTH, JAR_HEIGHT } from "./JarCanvas"

const RECORD_COLORS: Record<BabyRecord["type"], string> = {
    feeding: "bg-indigo-400",
    sleep: "bg-blue-400",
    diaper: "bg-amber-400",
    growth: "bg-green-400",
    note: "bg-purple-400",
    contraction: "bg-rose-400",
}

const RECORD_ICONS: Record<BabyRecord["type"], string> = {
    feeding: "🍼",
    sleep: "😴",
    diaper: "👶",
    growth: "📏",
    note: "📝",
    contraction: "⏱",
}

const HEX_DISPLAY_SIZE = 36 // px（DOM六角形のサイズ）

interface HexToken {
    id: number
    x: number
    y: number
    angle: number
    record: BabyRecord
}

interface Props {
    records: BabyRecord[]
    jarHandle: JarCanvasHandle | null
    onSelect: (record: BabyRecord) => void
}

export function JarHexTokenOverlay({ records, jarHandle, onSelect }: Props) {
    const [tokens, setTokens] = useState<HexToken[]>([])
    const rafRef = useRef<number>(0)
    const recordMapRef = useRef<Map<number, BabyRecord>>(new Map())

    // record map を最新に保つ
    useEffect(() => {
        const map = new Map<number, BabyRecord>()
        records.forEach(r => map.set(r.id, r))
        recordMapRef.current = map
    }, [records])

    // RAF で物理ボディ座標を追従
    const startTracking = useCallback(() => {
        if (!jarHandle) return
        function tick() {
            const positions = jarHandle!.getBodyPositions()
            const next: HexToken[] = []
            positions.forEach(({ x, y, angle }, id) => {
                const record = recordMapRef.current.get(id)
                if (record) next.push({ id, x, y, angle, record })
            })
            setTokens(next)
            rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(rafRef.current)
    }, [jarHandle])

    useEffect(() => {
        const cleanup = startTracking()
        return () => {
            if (cleanup) cleanup()
            cancelAnimationFrame(rafRef.current)
        }
    }, [startTracking])

    return (
        <div
            style={{ width: JAR_WIDTH, height: JAR_HEIGHT, position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        >
            {tokens.map(token => (
                <HexTokenItem
                    key={token.id}
                    token={token}
                    onSelect={onSelect}
                />
            ))}
        </div>
    )
}

function HexTokenItem({ token, onSelect }: { token: HexToken; onSelect: (r: BabyRecord) => void }) {
    const colorClass = RECORD_COLORS[token.record.type] ?? "bg-gray-400"
    const icon = RECORD_ICONS[token.record.type] ?? "●"
    const half = HEX_DISPLAY_SIZE / 2

    return (
        <button
            onClick={() => onSelect(token.record)}
            onKeyDown={e => e.key === "Enter" && onSelect(token.record)}
            title={token.record.type}
            style={{
                position: "absolute",
                left: token.x - half,
                top: token.y - half,
                width: HEX_DISPLAY_SIZE,
                height: HEX_DISPLAY_SIZE,
                transform: `rotate(${token.angle}rad)`,
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                pointerEvents: "auto",
                cursor: "pointer",
                border: "none",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                lineHeight: 1,
            }}
            className={`${colorClass} hover:brightness-110 active:brightness-125 transition-[filter]`}
        >
            <span style={{ transform: `rotate(${-token.angle}rad)`, display: "block" }}>
                {icon}
            </span>
        </button>
    )
}
