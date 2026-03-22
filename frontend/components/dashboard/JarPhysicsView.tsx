"use client"

import { useState, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { BabyRecord } from "@/types/record"
import { useRecordsByDate } from "@/hooks/useRecordsByDate"
import { JarDateNav } from "./JarDateNav"
import type { JarCanvasHandle } from "./JarCanvas"
import { JAR_WIDTH, JAR_HEIGHT } from "./JarCanvas"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"

const JarCanvas = dynamic(() => import("./JarCanvas").then(m => m.JarCanvas), {
    ssr: false,
    loading: () => (
        <div style={{ width: JAR_WIDTH, height: JAR_HEIGHT }} className="flex items-center justify-center">
            <BabyBottleLoading className="w-8 h-8 text-indigo-400" />
        </div>
    ),
})

const JarHexTokenOverlay = dynamic(() => import("./JarHexTokenOverlay").then(m => m.JarHexTokenOverlay), {
    ssr: false,
})

const RecordDetailDialog = dynamic(() => import("./RecordDetailDialog").then(m => m.RecordDetailDialog), {
    ssr: false,
})

interface Props {
    babyId: string
    records?: BabyRecord[]
    isLoading?: boolean
    mutate?: () => void
}

export function JarPhysicsView({ records, isLoading, mutate }: Props) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [selectedDate, setSelectedDate] = useState<Date>(today)
    const [selectedRecord, setSelectedRecord] = useState<BabyRecord | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const jarHandleRef = useRef<JarCanvasHandle | null>(null)

    const dayRecords = useRecordsByDate(records, selectedDate)

    const handleDateChange = useCallback((date: Date) => {
        date.setHours(0, 0, 0, 0)
        setSelectedDate(date)
        // 日付切り替え時にボディをクリア（JarCanvas 側は records 変化を検知して再投下）
        jarHandleRef.current?.clearAll()
    }, [])

    const handleReady = useCallback((handle: JarCanvasHandle) => {
        jarHandleRef.current = handle
    }, [])

    const handleSelect = useCallback((record: BabyRecord) => {
        setSelectedRecord(record)
        setDialogOpen(true)
    }, [])

    return (
        <div className="flex flex-col items-center">
            <JarDateNav date={selectedDate} onChange={handleDateChange} />

            {isLoading && !records ? (
                <div style={{ width: JAR_WIDTH, height: JAR_HEIGHT }} className="flex items-center justify-center">
                    <BabyBottleLoading className="w-8 h-8 text-indigo-400" />
                </div>
            ) : (
                <div style={{ position: "relative", width: JAR_WIDTH, height: JAR_HEIGHT }}>
                    {/* Layer 1: 物理シミュレーション（Canvas） */}
                    <JarCanvas records={dayRecords} onReady={handleReady} />

                    {/* Layer 2: ガラス瓶の SVG ビジュアル */}
                    <JarVisual />

                    {/* Layer 3: DOM 六角形オーバーレイ */}
                    <JarHexTokenOverlay
                        records={dayRecords}
                        jarHandle={jarHandleRef.current}
                        onSelect={handleSelect}
                    />
                </div>
            )}

            {dayRecords.length === 0 && !isLoading && (
                <p className="text-sm text-gray-400 dark:text-zinc-500 mt-3">この日の記録はありません</p>
            )}

            <RecordDetailDialog
                record={selectedRecord}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={() => mutate?.()}
            />
        </div>
    )
}

/** ガラス瓶のSVGビジュアル（物理ボディとは独立した装飾レイヤー） */
function JarVisual() {
    const w = JAR_WIDTH
    const h = JAR_HEIGHT
    const wallThick = 20
    // 瓶口の幅
    const neckW = 80
    const neckH = 30
    const bodyX = 0
    const bodyW = w
    const neckX = (w - neckW) / 2

    return (
        <svg
            width={w}
            height={h}
            viewBox={`0 0 ${w} ${h}`}
            style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
            aria-hidden
        >
            <defs>
                {/* ガラス感のグラデーション */}
                <linearGradient id="jar-glass" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(147,197,253,0.35)" />
                    <stop offset="40%" stopColor="rgba(255,255,255,0.08)" />
                    <stop offset="100%" stopColor="rgba(147,197,253,0.25)" />
                </linearGradient>
                <linearGradient id="jar-shine" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
            </defs>

            {/* 瓶の胴体外形 */}
            <rect
                x={bodyX} y={neckH}
                width={bodyW} height={h - neckH}
                rx={12}
                fill="url(#jar-glass)"
                stroke="rgba(147,197,253,0.5)"
                strokeWidth={1.5}
            />
            {/* 瓶口 */}
            <rect
                x={neckX} y={0}
                width={neckW} height={neckH + 12}
                rx={6}
                fill="rgba(147,197,253,0.2)"
                stroke="rgba(147,197,253,0.5)"
                strokeWidth={1.5}
            />
            {/* 左壁の内側（マスク） */}
            <rect x={0} y={neckH} width={wallThick} height={h - neckH} rx={0} fill="rgba(147,197,253,0.15)" />
            {/* 右壁の内側（マスク） */}
            <rect x={w - wallThick} y={neckH} width={wallThick} height={h - neckH} rx={0} fill="rgba(147,197,253,0.15)" />
            {/* 底面 */}
            <rect x={0} y={h - wallThick} width={w} height={wallThick} rx={0} fill="rgba(147,197,253,0.15)" />
            {/* 光沢ライン */}
            <rect x={bodyX + 6} y={neckH + 10} width={8} height={h - neckH - 20} rx={4} fill="url(#jar-shine)" opacity={0.6} />
        </svg>
    )
}
