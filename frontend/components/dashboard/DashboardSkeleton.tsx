import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            {/* プロフィールカード */}
            <Skeleton className="h-24 w-full rounded-2xl" />
            
            {/* ウィジェットグリッド */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-2xl" />
                ))}
            </div>
            
            {/* 育児日誌リンク */}
            <Skeleton className="h-12 w-full rounded-2xl" />
            
            {/* アクティビティフィード */}
            <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
    )
}
