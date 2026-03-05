"use client"
import { useCallback } from "react"
import { useRecords } from "@/hooks/useRecords"
import { useSelectedBaby } from "@/hooks/useSelectedBaby"
import { usePermissions } from "@/hooks/usePermissions"
import { useWindowSize } from "@/hooks/useWindowSize"
import { FeedingWidget } from "@/components/dashboard/FeedingWidget"
import { SleepWidget } from "@/components/dashboard/SleepWidget"
import { DiaperWidget } from "@/components/dashboard/DiaperWidget"
import { GrowthWidget } from "@/components/dashboard/GrowthWidget"
import { NoteWidget } from "@/components/dashboard/NoteWidget"
import { DiaryWidget } from "@/components/dashboard/DiaryWidget"
import { BabyWidget } from "@/components/dashboard/BabyWidget"
import { BirthRegistrationDialog } from "@/components/dashboard/BirthRegistrationDialog"
import { OnboardingForm } from "@/components/dashboard/OnboardingForm"
import { QuickActionBar } from "@/components/dashboard/QuickActionBar"
import { isBorn } from "@/lib/babyUtils"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { PullToRefresh } from "@/components/ui/pull-to-refresh"
import { HoneycombGrid } from "@/components/ui/honeycomb-grid"
import { HexagonWidgetCard } from "@/components/dashboard/HexagonWidgetCard"
import { DASHBOARD_UI } from "@/constants/dashboard"
import dynamic from "next/dynamic"
import { resolveThreshold } from '@/lib/thresholdUtils'
import { calcAge } from '@/lib/ageUtils'
import { motion, AnimatePresence } from "framer-motion"

const RecentActivityFeed = dynamic(() => import("@/components/dashboard/RecentActivityFeed").then(mod => mod.RecentActivityFeed), {
    loading: () => <Skeleton className="h-64 w-full rounded-2xl" />,
    ssr: false
})

export default function DashboardPage() {
    const { width } = useWindowSize()
    const { babies, isLoading, isError: babiesError, mutate: mutateBabies, selectedBabyId } = useSelectedBaby()
    const { canWrite, isAdmin } = usePermissions()

    const { records, isLoading: recordsLoading, isError: recordsError, mutate: mutateRecords } = useRecords(selectedBabyId)

    const handleMutateRecords = useCallback(() => {
        return mutateRecords()
    }, [mutateRecords])

    const handleRefresh = async () => {
        await Promise.all([
            mutateBabies(),
            mutateRecords()
        ])
    }

    if (isLoading && !babies) {
        return <DashboardSkeleton />
    }

    if (babiesError) {
        return <div className="p-8 text-center text-rose-500">赤ちゃんの情報の取得に失敗しました</div>
    }

    if (!babies || babies.length === 0) {
        return <OnboardingForm isAdmin={!!isAdmin} onSuccess={mutateBabies} />
    }

    const effectiveBabyId = selectedBabyId || (babies.length > 0 ? String(babies[0].id) : null)
    const selectedBaby = babies.find(b => String(b.id) === effectiveBabyId) || babies[0]
    const actualBabyId = selectedBaby ? String(selectedBaby.id) : null

    if (!selectedBaby || !actualBabyId) {
        return <OnboardingForm isAdmin={!!isAdmin} onSuccess={mutateBabies} />
    }

    const born = isBorn(selectedBaby.birthday)
    const honeycombSize = (width && width < 640) 
        ? DASHBOARD_UI.WIDGET_SIZE.MOBILE 
        : DASHBOARD_UI.WIDGET_SIZE.DESKTOP

    const ageMonths = selectedBaby?.birthday
        ? calcAge(selectedBaby.birthday).months
        : 0

    const feedingThreshold = resolveThreshold(
        ageMonths,
        selectedBaby?.feeding_threshold_minutes,
        'feeding'
    )
    const diaperThreshold = resolveThreshold(
        ageMonths,
        selectedBaby?.diaper_threshold_minutes,
        'diaper'
    )

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors pb-24">
            <PullToRefresh onRefresh={handleRefresh}>
                <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
                    {!born && canWrite && selectedBaby && (
                        <BirthRegistrationDialog
                            babyId={actualBabyId}
                            babyName={selectedBaby.name}
                            onSuccess={mutateBabies}
                        />
                    )}

                    <AnimatePresence mode="wait">
                        {recordsLoading && !records ? (
                            <motion.div
                                key="skeleton"
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <HoneycombGrid
                                    size={honeycombSize}
                                    gap={DASHBOARD_UI.WIDGET_GAP}
                                    rows={DASHBOARD_UI.WIDGET_ROWS}
                                    animate={false}
                                >
                                    {[...Array(7)].map((_, i) => (
                                        <HexagonWidgetCard
                                            key={i}
                                            isSkeleton
                                            size={honeycombSize}
                                        />
                                    ))}
                                </HoneycombGrid>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <HoneycombGrid
                                    size={honeycombSize}
                                    gap={DASHBOARD_UI.WIDGET_GAP}
                                    rows={DASHBOARD_UI.WIDGET_ROWS}
                                >
                                    <FeedingWidget
                                        babyId={actualBabyId}
                                        records={records}
                                        isLoading={recordsLoading}
                                        isError={recordsError}
                                        mutate={handleMutateRecords}
                                        size={honeycombSize}
                                        thresholdMinutes={feedingThreshold}
                                    />
                                    <SleepWidget
                                        babyId={actualBabyId}
                                        records={records}
                                        isLoading={recordsLoading}
                                        isError={recordsError}
                                        mutate={handleMutateRecords}
                                        size={honeycombSize}
                                    />
                                    <DiaperWidget
                                        babyId={actualBabyId}
                                        records={records}
                                        isLoading={recordsLoading}
                                        isError={recordsError}
                                        mutate={handleMutateRecords}
                                        size={honeycombSize}
                                        thresholdMinutes={diaperThreshold}
                                    />
                                    <GrowthWidget
                                        babyId={actualBabyId}
                                        records={records}
                                        isLoading={recordsLoading}
                                        isError={recordsError}
                                        size={honeycombSize}
                                    />
                                    <NoteWidget
                                        babyId={actualBabyId}
                                        records={records}
                                        isLoading={recordsLoading}
                                        isError={recordsError}
                                        size={honeycombSize}
                                    />
                                    <DiaryWidget
                                        babyId={actualBabyId}
                                        size={honeycombSize}
                                    />
                                    <BabyWidget
                                        baby={selectedBaby}
                                        size={honeycombSize}
                                    />
                                </HoneycombGrid>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <RecentActivityFeed
                        babyId={actualBabyId}
                        records={records}
                        isLoading={recordsLoading}
                        mutate={handleMutateRecords}
                    />
                </main>
            </PullToRefresh>

            {born && (
                <QuickActionBar
                    babyId={actualBabyId}
                    mutateRecords={handleMutateRecords}
                    records={records}
                />
            )}
        </div>
    )
}
