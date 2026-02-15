"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRecords, BabyRecord } from "@/hooks/useData"
import { formatElapsed } from "@/lib/ageUtils"

const TYPE_ICONS: Record<string, string> = {
    feeding: "🍼",
    sleep: "💤",
    diaper: "👶",
    growth: "📏",
}

const TYPE_LABELS: Record<string, string> = {
    feeding: "授乳",
    sleep: "睡眠",
    diaper: "おむつ",
    growth: "成長",
}

interface Props {
    babyId: string
}

export function RecentActivityFeed({ babyId }: Props) {
    const { records, isLoading } = useRecords(babyId)

    const recent = records?.slice(0, 10) ?? []

    return (
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
                            <li key={`${record.type}-${record.id}`} className="flex items-center gap-3">
                                <span className="text-xl">{TYPE_ICONS[record.type] ?? "📝"}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">
                                        {TYPE_LABELS[record.type] ?? record.type}
                                    </p>
                                    {record.notes && (
                                        <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">{record.notes}</p>
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
    )
}
