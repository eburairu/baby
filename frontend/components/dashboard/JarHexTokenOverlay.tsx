"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { type LucideIcon, StickyNote, HandHeart, Milk, Droplets, Biohazard, Smile } from "lucide-react"
import { BabyRecord } from "@/types/record"
import { JarCanvasHandle, JAR_WIDTH, JAR_HEIGHT } from "./JarCanvas"
import { Hexagon } from "@/components/ui/hexagon"
import { RECORD_TYPE_LUCIDE_ICONS, RECORD_TYPE_BG_COLORS, RECORD_TYPE_COLORS } from "@/constants/ui"
import { cn } from "@/lib/utils"

// トークンサイズ（Hexagon size, pointy-top）
// height = HEX_SIZE, width = HEX_SIZE * √3/2 ≈ HEX_SIZE * 0.866
const HEX_SIZE = 44

function getRecordIcon(record: BabyRecord): LucideIcon {
    if (record.type === "feeding") {
        const feedingType = record.details?.feeding_type as string | undefined
        if (feedingType === "BREAST") return HandHeart
        return Milk
    }
    if (record.type === "diaper") {
        const diaperType = record.details?.diaper_type as string | undefined
        if (diaperType === "DIRTY" || diaperType === "BOTH") return Biohazard
        if (diaperType === "WET") return Droplets
        return Smile
    }
    const type = record.type as keyof typeof RECORD_TYPE_LUCIDE_ICONS
    return RECORD_TYPE_LUCIDE_ICONS[type] ?? StickyNote
}

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

    useEffect(() => {
        const map = new Map<number, BabyRecord>()
        records.forEach(r => map.set(r.id, r))
        recordMapRef.current = map
    }, [records])

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
    const type = token.record.type as keyof typeof RECORD_TYPE_LUCIDE_ICONS
    const LucideIconComponent = getRecordIcon(token.record)
    const bgClass = RECORD_TYPE_BG_COLORS[type] ?? "text-gray-100 dark:text-zinc-800"
    const colorClass = RECORD_TYPE_COLORS[type] ?? "text-muted-foreground"

    // Hexagon size=HEX_SIZE の pointy-top: width = HEX_SIZE * √3/2, height = HEX_SIZE
    const hexW = HEX_SIZE * Math.sqrt(3) / 2
    const hexH = HEX_SIZE

    return (
        <button
            onClick={() => onSelect(token.record)}
            title={token.record.type}
            style={{
                position: "absolute",
                left: token.x - hexW / 2,
                top: token.y - hexH / 2,
                transform: `rotate(${token.angle}rad)`,
                pointerEvents: "auto",
                cursor: "pointer",
                border: "none",
                padding: 0,
                background: "none",
            }}
            className="hover:brightness-110 active:brightness-125 transition-[filter]"
        >
            <Hexagon
                size={HEX_SIZE}
                cornerRadius={5}
                pointy
                className={cn("shrink-0", bgClass)}
            >
                <LucideIconComponent
                    className={cn("h-4 w-4", colorClass)}
                    aria-hidden
                />
            </Hexagon>
        </button>
    )
}
