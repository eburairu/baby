"use client"
import React, { useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"
import { BabyRecord } from "@/types/record"
import dynamic from "next/dynamic"
import { ActivityItem } from "./ActivityItem"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"

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

    const { visibleItems: recent, hasMore, sentinelRef } = useInfiniteScroll(allRecords, {
        initialCount: PAGE_SIZE,
        step: PAGE_SIZE,
        threshold: 0.1
    })

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
                <CardContent>
                    {isLoading && recent.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <BabyBottleLoading className="w-8 h-8 text-indigo-400" />
                        </div>
                    ) : recent.length > 0 ? (
                        <>
                            <ul className="space-y-3">
                                {/* initial={false}: マウント時の既存アイテムはアニメーションしない。新規追加分のみスライドイン */}
                                <AnimatePresence initial={false} mode="popLayout">
                                    {recent.map((record: BabyRecord, index: number) => (
                                        <React.Fragment key={`${record.type}-${record.id}`}>
                                            <motion.div
                                                key={`motion-${record.type}-${record.id}`}
                                                layout
                                                initial={{ opacity: 0, y: -12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                transition={{ duration: 0.22, ease: "easeOut" }}
                                            >
                                                <ActivityItem
                                                    record={record}
                                                    onClick={handleRecordClick}
                                                />
                                            </motion.div>
                                            {(index + 1) % 10 === 0 && (
                                                <li className="list-none">
                                                    <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID ?? ""} />
                                                </li>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </AnimatePresence>
                            </ul>
                            {hasMore ? (
                                <div ref={sentinelRef} className="mt-3 flex justify-center py-1">
                                    <p className="text-xs text-gray-400 dark:text-zinc-500 animate-pulse">読み込み中...</p>
                                </div>
                            ) : allRecords.length > PAGE_SIZE ? (
                                <p className="mt-3 text-xs text-center text-gray-400 dark:text-zinc-500">すべての記録を表示しています</p>
                            ) : null}
                        </>
                    ) : (
                        <p className="text-sm text-gray-400 dark:text-zinc-500">記録がありません</p>
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
