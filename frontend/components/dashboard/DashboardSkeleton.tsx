import { Skeleton } from "@/components/ui/skeleton"
import { HoneycombGrid } from "@/components/ui/honeycomb-grid"
import { useWindowSize } from "@/hooks/useWindowSize"
import { Hexagon } from "@/components/ui/hexagon"
import { DASHBOARD_UI } from "@/constants/dashboard"

export function DashboardSkeleton() {
    const { width } = useWindowSize()
    const honeycombSize = (width && width < 640) 
        ? DASHBOARD_UI.WIDGET_SIZE.MOBILE 
        : DASHBOARD_UI.WIDGET_SIZE.DESKTOP

    return (
        <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
            {/* プロフィールカード */}
            <Skeleton className="h-44 w-full rounded-2xl" />
            
            {/* ハニカムウィジェットグリッドスケルトン */}
            <HoneycombGrid
                size={honeycombSize}
                gap={DASHBOARD_UI.WIDGET_GAP}
                rows={DASHBOARD_UI.WIDGET_ROWS}
            >
                {[...Array(6)].map((_, i) => (
                    <Hexagon
                        key={i}
                        size={honeycombSize}
                        color="currentColor"
                        className="text-muted/50 animate-pulse"
                    />
                ))}
            </HoneycombGrid>
            
            {/* アクティビティフィード */}
            <Skeleton className="h-64 w-full rounded-2xl" />
        </main>
    )
}
