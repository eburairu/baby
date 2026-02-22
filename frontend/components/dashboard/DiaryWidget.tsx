"use client"
import { memo } from "react"
import { BookOpen } from "lucide-react"
import { useDailySummaries } from "@/hooks/useDailySummary"
import { isApiError } from "@/lib/api"
import { WidgetCard } from "./WidgetCard"

interface Props {
    babyId: string
}

export const DiaryWidget = memo(function DiaryWidget({ babyId }: Props) {
    const { summaries, isLoading, error } = useDailySummaries(parseInt(babyId, 10))
    const isAccessDenied = isApiError(error) && error.status === 403

    const latestSummary = summaries?.[0]

    // 日付ラベル（最新の日誌の日付）
    const dateLabel = latestSummary
        ? new Date(latestSummary.summary_date + "T00:00:00").toLocaleDateString("ja-JP", { month: "short", day: "numeric" })
        : null

    const title = (
        <>
            <BookOpen className="h-4 w-4" />
            育児日誌
        </>
    )

    return (
        <WidgetCard
            title={title}
            titleClassName="text-amber-600 dark:text-amber-500 gap-1.5"
            href={`/diary?baby_id=${babyId}`}
            isAccessDenied={isAccessDenied}
            isLoading={isLoading}
            loadingColorClass="text-amber-400"
            actionButtonClassName="hover:text-amber-600 dark:hover:text-amber-500"
        >
            {latestSummary ? (
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
