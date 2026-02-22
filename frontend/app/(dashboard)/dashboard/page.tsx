"use client"
import { useEffect } from "react"
import { useBabies, useRecords } from "@/hooks/useData"
import { usePermissions } from "@/hooks/usePermissions"
import { useBabyStore } from "@/stores/babyStore"
import { BabyProfileCard } from "@/components/dashboard/BabyProfileCard"
import { FeedingWidget } from "@/components/dashboard/FeedingWidget"
import { SleepWidget } from "@/components/dashboard/SleepWidget"
import { DiaperWidget } from "@/components/dashboard/DiaperWidget"
import { GrowthWidget } from "@/components/dashboard/GrowthWidget"
import { NoteWidget } from "@/components/dashboard/NoteWidget"
import { BirthRegistrationDialog } from "@/components/dashboard/BirthRegistrationDialog"
import { OnboardingForm } from "@/components/dashboard/OnboardingForm"
import { QuickActionBar } from "@/components/dashboard/QuickActionBar"
import { isBorn } from "@/lib/babyUtils"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton"
import dynamic from "next/dynamic"

const RecentActivityFeed = dynamic(() => import("@/components/dashboard/RecentActivityFeed").then(mod => mod.RecentActivityFeed), {
    loading: () => <Skeleton className="h-32 w-full rounded-2xl" />,
    ssr: false
})

export default function DashboardPage() {
    const { babies, isLoading, isError: babiesError, mutate: mutateBabies } = useBabies()
    const { selectedBabyId, setSelectedBabyId } = useBabyStore()
    const { canWrite } = usePermissions()

    // Default to first baby if none selected
    useEffect(() => {
        if (babies && babies.length > 0 && !selectedBabyId) {
            setSelectedBabyId(String(babies[0].id))
        }
    }, [babies, selectedBabyId, setSelectedBabyId])

    const { records, isLoading: recordsLoading, isError: recordsError, mutate: mutateRecords } = useRecords(selectedBabyId)

    if (isLoading && !babies) {
        return <DashboardSkeleton />
    }

    if (babiesError) {
        return <div className="p-8 text-center text-rose-500">赤ちゃんの情報の取得に失敗しました</div>
    }

    if (!babies || babies.length === 0) {
        return <OnboardingForm onSuccess={mutateBabies} />
    }

    const selectedBaby = babies.find(b => String(b.id) === (selectedBabyId || String(babies[0].id)))
    const born = selectedBaby ? isBorn(selectedBaby) : false
    const babiesWithStrId = babies.map(b => ({ ...b, id: String(b.id) }))

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors pb-24">
            <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
                <BabyProfileCard
                    babies={babiesWithStrId}
                    selectedBabyId={selectedBabyId || String(babies[0].id)}
                />

                {!born && canWrite && (
                    <BirthRegistrationDialog
                        baby={selectedBaby!}
                        onSuccess={mutateBabies}
                    />
                )}

                <div className="grid grid-cols-2 gap-4">
                    <FeedingWidget babyId={selectedBabyId} records={records} />
                    <SleepWidget babyId={selectedBabyId} records={records} />
                    <DiaperWidget babyId={selectedBabyId} records={records} />
                    <GrowthWidget babyId={selectedBabyId} records={records} />
                </div>

                <NoteWidget babyId={selectedBabyId} records={records} />

                <RecentActivityFeed
                    records={records || []}
                    isLoading={recordsLoading}
                    isError={!!recordsError}
                    onRefresh={mutateRecords}
                />
            </main>

            <QuickActionBar />
        </div>
    )
}
