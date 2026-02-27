"use client"
import { useCallback } from "react"
import { useRecords } from "@/hooks/useData"
import { useSelectedBaby } from "@/hooks/useSelectedBaby"
import { usePermissions } from "@/hooks/usePermissions"
import { BabyProfileCard } from "@/components/dashboard/BabyProfileCard"
import { FeedingWidget } from "@/components/dashboard/FeedingWidget"
import { SleepWidget } from "@/components/dashboard/SleepWidget"
import { DiaperWidget } from "@/components/dashboard/DiaperWidget"
import { GrowthWidget } from "@/components/dashboard/GrowthWidget"
import { NoteWidget } from "@/components/dashboard/NoteWidget"
import { DiaryWidget } from "@/components/dashboard/DiaryWidget"
import { BirthRegistrationDialog } from "@/components/dashboard/BirthRegistrationDialog"
import { OnboardingForm } from "@/components/dashboard/OnboardingForm"
import { QuickActionBar } from "@/components/dashboard/QuickActionBar"
import { isBorn } from "@/lib/babyUtils"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { PullToRefresh } from "@/components/ui/pull-to-refresh"
import { HoneycombGrid } from "@/components/ui/honeycomb-grid"
import { useWindowSize } from "@/hooks/useWindowSize"
import dynamic from "next/dynamic"

const RecentActivityFeed = dynamic(() => import("@/components/dashboard/RecentActivityFeed").then(mod => mod.RecentActivityFeed), {
    loading: () => <Skeleton className="h-32 w-full rounded-2xl" />,
    ssr: false
})

export default function DashboardPage() {
    const { babies, isLoading, isError: babiesError, mutate: mutateBabies, selectedBabyId } = useSelectedBaby()
    const { canWrite, isAdmin } = usePermissions()
    const { width } = useWindowSize()

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

    const effectiveBabyId = selectedBabyId || String(babies[0].id)
    const selectedBaby = babies.find(b => String(b.id) === effectiveBabyId)
    const born = selectedBaby ? isBorn(selectedBaby.birthday) : true
    const babiesWithStrId = babies.map(b => ({ ...b, id: String(b.id) }))

    // レスポンシブサイズの計算
    const honeycombSize = (width && width < 640) ? 150 : 170

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors pb-24">
            <PullToRefresh onRefresh={handleRefresh}>
                <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
                    <BabyProfileCard
                        key={effectiveBabyId}
                        babies={babiesWithStrId}
                        selectedBabyId={effectiveBabyId}
                    />

                    {!born && canWrite && selectedBaby && (
                        <BirthRegistrationDialog
                            babyId={effectiveBabyId}
                            babyName={selectedBaby.name}
                            onSuccess={mutateBabies}
                        />
                    )}

                    <HoneycombGrid
                        size={honeycombSize}
                        gap={8}
                        rows={[[0, 1], [2], [3, 4], [5]]}
                    >
                        <FeedingWidget
                            babyId={effectiveBabyId}
                            records={records}
                            isLoading={recordsLoading}
                            isError={recordsError}
                            mutate={handleMutateRecords}
                        />
                        <SleepWidget
                            babyId={effectiveBabyId}
                            records={records}
                            isLoading={recordsLoading}
                            isError={recordsError}
                            mutate={handleMutateRecords}
                        />
                        <DiaperWidget
                            babyId={effectiveBabyId}
                            records={records}
                            isLoading={recordsLoading}
                            isError={recordsError}
                            mutate={handleMutateRecords}
                        />
                        <GrowthWidget
                            babyId={effectiveBabyId}
                            records={records}
                            isLoading={recordsLoading}
                            isError={recordsError}
                        />
                        <NoteWidget
                            babyId={effectiveBabyId}
                            records={records}
                            isLoading={recordsLoading}
                            isError={recordsError}
                        />
                        <DiaryWidget
                            babyId={effectiveBabyId}
                        />
                    </HoneycombGrid>

                    <RecentActivityFeed
                        babyId={effectiveBabyId}
                        records={records}
                        isLoading={recordsLoading}
                        mutate={handleMutateRecords}
                    />
                </main>
            </PullToRefresh>

            {born && (
                <QuickActionBar
                    babyId={effectiveBabyId}
                    mutateRecords={handleMutateRecords}
                    records={records}
                />
            )}
        </div>
    )
}
