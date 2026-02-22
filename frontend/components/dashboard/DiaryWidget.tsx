"use client"
import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, BookOpen, ShieldOff } from "lucide-react"
import { useDailySummaries } from "@/hooks/useDailySummary"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"
import { isApiError } from "@/lib/api"

interface Props {
    babyId: string
}

export const DiaryWidget = memo(function DiaryWidget({ babyId }: Props) {
    const { summaries, isLoading, error } = useDailySummaries(parseInt(babyId, 10))
    const isAccessDenied = isApiError(error) && error.status === 403

    if (isAccessDenied) {
        return (
            <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 opacity-60 transition-colors">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-400 dark:text-zinc-500 flex items-center gap-1">
                        📔 日誌
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                    <ShieldOff className="h-6 w-6 text-gray-300 dark:text-zinc-700 mb-1" />
                    <p className="text-[10px] text-gray-400 dark:text-zinc-600">閲覧制限中</p>
                </CardContent>
            </Card>
        )
    }

    const latestSummary = summaries?.[0]
    
    // 日付ラベル（最新の日誌の日付）
    const dateLabel = latestSummary 
        ? new Date(latestSummary.summary_date + "T00:00:00").toLocaleDateString("ja-JP", { month: "short", day: "numeric" })
        : null

    return (
        <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-500 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    育児日誌
                </CardTitle>
                <Link href={`/diary?baby_id=${babyId}`}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mr-2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 dark:text-zinc-600"
                        aria-label="日誌一覧"
                        title="詳細を見る"
                    >
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="space-y-2">
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
            </CardContent>
        </Card>
    )
})
