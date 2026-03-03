"use client"
import React, { useState, useCallback, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"
import { BabyRecord } from "@/types/record"
import dynamic from "next/dynamic"
import { ActivityItem } from "./ActivityItem"
import { useVirtualizer } from "@tanstack/react-virtual"

const RecordDetailDialog = dynamic(() => import("./RecordDetailDialog").then(mod => mod.RecordDetailDialog), {
    ssr: false
})

const AdUnit = dynamic(() => import("@/components/ads/AdUnit"), {
    ssr: false
})

const PAGE_SIZE = 10

interface Props {
    babyId: string
    records?: BabyRecord[]
    isLoading?: boolean
    mutate?: () => void
}

export const RecentActivityFeed = React.memo(function RecentActivityFeed({ records, isLoading, mutate }: Props) {
    const [selectedRecord, setSelectedRecord] = useState<BabyRecord | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    const allRecords = records ?? []

    // スクロールで表示する件数を管理（遅延読み込み用）
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
    const hasMore = visibleCount < allRecords.length

    const visibleRecords = allRecords.slice(0, visibleCount)

    // リストの親コンテナの参照
    const parentRef = useRef<HTMLDivElement>(null)

    // 要素の高さを推定する（ActivityItem自体は固定高に近いが、AdUnitなどで可変になるため）
    const rowVirtualizer = useVirtualizer({
        count: visibleRecords.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => {
            // 10件ごとの広告枠を含む場合は高めに設定
            if ((index + 1) % 10 === 0) {
                return 150 // ActivityItem + AdUnit の概算高さ
            }
            return 72 // ActivityItem の概算高さ
        },
        overscan: 5,
    })

    // 無限スクロールの検知: 最下部に近づいたら読み込み件数を増やす
    const virtualItems = rowVirtualizer.getVirtualItems()
    useEffect(() => {
        if (!hasMore || virtualItems.length === 0) return

        const lastItem = virtualItems[virtualItems.length - 1]
        if (lastItem.index >= visibleRecords.length - 1) {
            setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, allRecords.length))
        }
    }, [virtualItems, hasMore, visibleRecords.length, allRecords.length])

    // Handle record click to show detail dialog
    // Optimized: Memoized to prevent re-rendering all ActivityItems when list grows
    const handleRecordClick = useCallback((record: BabyRecord) => {
        setSelectedRecord(record)
        setDialogOpen(true)
    }, [])

    return (
        <>
            <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 transition-colors">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-zinc-300">最近の記録</CardTitle>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <BabyBottleLoading className="w-8 h-8 text-indigo-400" />
                        </div>
                    ) : visibleRecords.length > 0 ? (
                        <div
                            ref={parentRef}
                            className="max-h-[500px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700"
                        >
                            <ul
                                className="relative w-full"
                                style={{
                                    height: `${rowVirtualizer.getTotalSize()}px`,
                                }}
                            >
                                {virtualItems.map((virtualRow) => {
                                    const record = visibleRecords[virtualRow.index]
                                    const isAdSlot = (virtualRow.index + 1) % 10 === 0

                                    return (
                                        <li
                                            key={virtualRow.key}
                                            data-index={virtualRow.index}
                                            ref={rowVirtualizer.measureElement}
                                            className="absolute top-0 left-0 w-full px-2"
                                            style={{
                                                transform: `translateY(${virtualRow.start}px)`,
                                            }}
                                        >
                                            <div className="pb-3">
                                                <ActivityItem
                                                    record={record}
                                                    onClick={handleRecordClick}
                                                />
                                                {isAdSlot && (
                                                    <div className="mt-3">
                                                        <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID ?? ""} />
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>

                            {hasMore && (
                                <div className="flex justify-center py-4">
                                    <p className="text-xs text-gray-400 dark:text-zinc-500 animate-pulse">読み込み中...</p>
                                </div>
                            )}

                            {!hasMore && allRecords.length > PAGE_SIZE && (
                                <p className="pb-4 pt-2 text-xs text-center text-gray-400 dark:text-zinc-500">すべての記録を表示しています</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-4">記録がありません</p>
                    )}
                </CardContent>
            </Card>

            <RecordDetailDialog
                record={selectedRecord}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={() => mutate && mutate()}
            />
        </>
    )
})
