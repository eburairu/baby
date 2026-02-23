"use client"
import { memo } from "react"
import { BookOpen } from "lucide-react"
import { useDailySummaries } from "@/hooks/useDailySummary"
import { WidgetCard } from "./WidgetCard"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"

interface Props {
    babyId: string
}

export const DiaryWidget = memo(function DiaryWidget({ babyId }: Props) {
    const { summaries, isLoading, error } = useDailySummaries(parseInt(babyId, 10))

    const latestSummary = summaries?.[0]
    
    // 日付ラベル（最新の日誌の日付）
    const dateLabel = latestSummary 
        ? new Date(latestSummary.summary_date + "T00:00:00").toLocaleDateString("ja-JP", { month: "short", day: "numeric" })
        : null

    return (
        <WidgetCard
            title={
                <span className="text-amber-600 dark:text-amber-500 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    育児日誌
                </span>
            }
            href={`/diary?baby_id=${babyId}`}
            isError={error}
            actionHoverColor="hover:text-amber-600 dark:hover:text-amber-500"
            ariaLabel="育児日誌の詳細を見る"
        >
            {isLoading ? (
                <div className="flex justify-center py-4">
                    <BabyBottleLoading className="w-8 h-8 text-amber-400" />
                </div>
            ) : latestSummary ? (
                <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">{dateLabel} のまとめ</p>
                    <p className="text-sm text-gray-700 dark:text-zinc-300 line-clamp-3 leading-relaxed font-medium">
                        {latestSummary.display_content}
                    </p>
                </div>
            ) : (
                <div className="py-4">
                    <p className="text-sm text-gray-400 dark:text-zinc-600">日誌がありません</p>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-600 mt-1">記録をもとに日誌を生成できます</p>
                </div>
            )}
        </WidgetCard>
    )
})
