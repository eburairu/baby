"use client"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"
import { BabyRecord } from "@/hooks/useData"
import { formatElapsed } from "@/lib/ageUtils"
import { MessageCircle, User } from "lucide-react"
import dynamic from "next/dynamic"

const RecordDetailDialog = dynamic(() => import("./RecordDetailDialog").then(mod => mod.RecordDetailDialog), {
    ssr: false
})

const TYPE_ICONS: Record<string, string> = {
    feeding: "🍼",
    sleep: "💤",
    diaper: "👶",
    growth: "📏",
    note: "📝",
    contraction: "⚡",
}

const TYPE_LABELS: Record<string, string> = {
    feeding: "授乳",
    sleep: "睡眠",
    diaper: "おむつ",
    growth: "成長",
    note: "メモ",
    contraction: "陣痛",
}

const PAGE_SIZE = 10

interface Props {
    babyId: string
    records?: BabyRecord[]
    isLoading?: boolean
    mutate?: () => void
}

export function RecentActivityFeed({ babyId, records, isLoading, mutate }: Props) {
    const [selectedRecord, setSelectedRecord] = useState<BabyRecord | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
    const sentinelRef = useRef<HTMLDivElement>(null)

    // babyId が変わったら表示件数をリセット
    useEffect(() => {
        setVisibleCount(PAGE_SIZE)
    }, [babyId])

    const allRecords = records ?? []
    const recent = allRecords.slice(0, visibleCount)
    const hasMore = visibleCount < allRecords.length

    // センチネル要素が見えたら次の PAGE_SIZE 件を追加表示
    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || !hasMore) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount((prev) => prev + PAGE_SIZE)
                }
            },
            { threshold: 0.1 }
        )
        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [hasMore, recent.length])

    const handleRecordClick = (record: BabyRecord) => {
        setSelectedRecord(record)
        setDialogOpen(true)
    }

    return (
        <>
            <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 transition-colors">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-zinc-300">最近の記録</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <BabyBottleLoading className="w-8 h-8 text-indigo-400" />
                        </div>
                    ) : recent.length > 0 ? (
                        <>
                            <ul className="space-y-3">
                                {recent.map((record: BabyRecord) => (
                                    <li
                                        key={`${record.type}-${record.id}`}
                                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 p-1 rounded-lg transition-colors"
                                        onClick={() => handleRecordClick(record)}
                                    >
                                        <span className="text-xl">{TYPE_ICONS[record.type] ?? "📝"}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">
                                                {TYPE_LABELS[record.type] ?? record.type}
                                            </p>
                                            {record.details.notes ? (
                                                <p className="text-xs text-gray-400 dark:text-zinc-500 line-clamp-2">{record.details.notes}</p>
                                            ) : null}
                                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                                {record.recorded_by_display_name ? (
                                                    <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-zinc-500">
                                                        <User className="w-3 h-3" />
                                                        {record.recorded_by_display_name}
                                                    </span>
                                                ) : null}
                                                {record.comment_count > 0 ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        <MessageCircle className="w-3 h-3 text-orange-400" />
                                                        <span className="text-[10px] font-medium text-orange-500">
                                                            {record.comment_count}件のメッセージ
                                                        </span>
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400 dark:text-zinc-500 whitespace-nowrap">
                                            {formatElapsed(record.timestamp)}
                                        </span>
                                    </li>
                                ))}
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
}
