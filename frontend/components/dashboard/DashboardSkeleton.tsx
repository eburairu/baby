import { Skeleton } from "@/components/ui/skeleton"
import { HoneycombGrid } from "@/components/ui/honeycomb-grid"
import { useWindowSize } from "@/hooks/useWindowSize"
import { HexagonWidgetCard } from "./HexagonWidgetCard"
import { DASHBOARD_UI } from "@/constants/dashboard"

export function DashboardSkeleton() {
    const { width } = useWindowSize()
    const honeycombSize = (width && width < 640) 
        ? DASHBOARD_UI.WIDGET_SIZE.MOBILE 
        : DASHBOARD_UI.WIDGET_SIZE.DESKTOP

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors pb-24">
            <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
                {/* ハニカムウィジェットグリッドスケルトン */}
                <HoneycombGrid
                    size={honeycombSize}
                    gap={DASHBOARD_UI.WIDGET_GAP}
                    rows={DASHBOARD_UI.WIDGET_ROWS}
                >
                    {[...Array(7)].map((_, i) => (
                        <HexagonWidgetCard
                            key={i}
                            isSkeleton
                            size={honeycombSize}
                        />
                    ))}
                </HoneycombGrid>
                
                {/* アクティビティフィードのスケルトン */}
                <div className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
            </main>
        </div>
    )
}
