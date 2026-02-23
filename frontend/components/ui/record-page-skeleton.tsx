import { Skeleton } from "@/components/ui/skeleton"

/**
 * 育児記録ページ共通のスケルトン表示
 */
export function RecordPageSkeleton() {
    return (
        <div className="space-y-6">
            {/* 統計/サマリーのスケルトン */}
            <Skeleton className="h-32 w-full rounded-2xl" />

            {/* アドバイスカードのスケルトン */}
            <Skeleton className="h-24 w-full rounded-2xl" />

            {/* 入力フォームのスケルトン */}
            <Skeleton className="h-48 w-full rounded-2xl" />

            {/* 履歴セクションのスケルトン */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-32 rounded-lg ml-1" />
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        </div>
    )
}
