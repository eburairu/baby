"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRecords, BabyRecord } from "@/hooks/useData"
import { formatElapsed } from "@/lib/ageUtils"
import { RecordDetailDialog } from "./RecordDetailDialog"

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

interface Props {
    babyId: string
}

export function RecentActivityFeed({ babyId }: Props) {
    const { records, isLoading, mutate } = useRecords(babyId)
    const [selectedRecord, setSelectedRecord] = useState<BabyRecord | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    const recent = records?.slice(0, 10) ?? []

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
                        <p className="text-sm text-gray-400 dark:text-zinc-500">読み込み中...</p>
                    ) : recent.length > 0 ? (
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
                                        {record.details.notes && (
                                            <p className="text-xs text-gray-400 dark:text-zinc-500 line-clamp-2">{record.details.notes}</p>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400 dark:text-zinc-500 whitespace-nowrap">
                                        {formatElapsed(record.timestamp)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400 dark:text-zinc-500">記録がありません</p>
                    )}
                </CardContent>
            </Card>

            <RecordDetailDialog
                record={selectedRecord}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={() => mutate()}
            />
        </>
    )
}
