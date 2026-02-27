import { Skeleton } from "@/components/ui/skeleton"
import { HoneycombGrid } from "@/components/ui/honeycomb-grid"
import { useWindowSize } from "@/hooks/useWindowSize"

export function DashboardSkeleton() {
    const { width } = useWindowSize()
    const honeycombSize = (width && width < 640) ? 150 : 170

    return (
        <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
            {/* プロフィールカード */}
            <Skeleton className="h-44 w-full rounded-2xl" />
            
            {/* ハニカムウィジェットグリッドスケルトン */}
            <HoneycombGrid
                size={honeycombSize}
                gap={16}
                rows={[[0, 1], [2], [3, 4], [5]]}
            >
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-full rounded-full" />
                ))}
            </HoneycombGrid>
            
            {/* アクティビティフィード */}
            <Skeleton className="h-64 w-full rounded-2xl" />
        </main>
    )
}
