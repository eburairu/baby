"use client"

import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { BabyRecord } from "@/types/record"
import { useRecordsByDate } from "@/hooks/useRecordsByDate"
import { JarDateNav } from "./JarDateNav"
import { JarShelf } from "./JarShelf"
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

export function JarPhysicsView({ babyId, records, isLoading, mutate }: Props) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [selectedDate, setSelectedDate] = useState<Date>(today)
    const [selectedRecord, setSelectedRecord] = useState<BabyRecord | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [jarHandle, setJarHandle] = useState<JarCanvasHandle | null>(null)

    const { dayRecords, isLoading: dateLoading } = useRecordsByDate(records, babyId, selectedDate)

    const handleDateChange = useCallback((date: Date) => {
        date.setHours(0, 0, 0, 0)
        setSelectedDate(date)
        // 日付切り替え時にボディをクリア（JarCanvas 側は records 変化を検知して再投下）
        setJarHandle(prev => { prev?.clearAll(); return prev })
    }, [])

    const handleReady = useCallback((handle: JarCanvasHandle) => {
        setJarHandle(handle)
    }, [])

    const handleSelect = useCallback((record: BabyRecord) => {
        setSelectedRecord(record)
        setDialogOpen(true)
    }, [])

    return (
        <div className="flex flex-col items-center pb-24">
            <JarDateNav date={selectedDate} onChange={handleDateChange} />

            {(isLoading && !records) || dateLoading ? (
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
                        jarHandle={jarHandle}
                        onSelect={handleSelect}
                    />
                </div>
            )}

            {dayRecords.length === 0 && !isLoading && !dateLoading && (
                <p className="text-sm text-gray-400 dark:text-zinc-500 mt-3">この日の記録はありません</p>
            )}

            <JarShelf
                records={records}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
            />

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
    const neckW = 70
    const neckH = 28
    const neckX = (w - neckW) / 2

    // 瓶の輪郭パス（首 + 胴体を1つのパスで）
    const r = 10 // 胴体の角丸
    const path = [
        `M ${neckX} ${neckH}`,
        `L ${neckX} 4`,
        `Q ${neckX} 0 ${neckX + 4} 0`,
        `L ${neckX + neckW - 4} 0`,
        `Q ${neckX + neckW} 0 ${neckX + neckW} 4`,
        `L ${neckX + neckW} ${neckH}`,
        `L ${w - r} ${neckH}`,
        `Q ${w} ${neckH} ${w} ${neckH + r}`,
        `L ${w} ${h - r}`,
        `Q ${w} ${h} ${w - r} ${h}`,
        `L ${r} ${h}`,
        `Q 0 ${h} 0 ${h - r}`,
        `L 0 ${neckH + r}`,
        `Q 0 ${neckH} ${r} ${neckH}`,
        `Z`,
    ].join(" ")

    return (
        <svg
            width={w}
            height={h}
            viewBox={`0 0 ${w} ${h}`}
            style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
            aria-hidden
        >
            {/* 瓶の輪郭（ストロークのみ） */}
            <path
                d={path}
                fill="rgba(186,230,253,0.12)"
                stroke="rgba(147,197,253,0.55)"
                strokeWidth={1.5}
            />
            {/* 左壁オーバーレイ */}
            <rect x={0} y={neckH} width={wallThick} height={h - neckH} fill="rgba(186,230,253,0.12)" />
            {/* 右壁オーバーレイ */}
            <rect x={w - wallThick} y={neckH} width={wallThick} height={h - neckH} fill="rgba(186,230,253,0.12)" />
            {/* 底面オーバーレイ */}
            <rect x={0} y={h - wallThick} width={w} height={wallThick} fill="rgba(186,230,253,0.12)" />
            {/* 光沢ライン */}
            <rect x={7} y={neckH + 8} width={5} height={h - neckH - 16} rx={3} fill="rgba(255,255,255,0.25)" />
        </svg>
    )
}
