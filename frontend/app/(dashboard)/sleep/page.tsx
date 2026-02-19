"use client"

import { useSleeps, useBabies } from "@/hooks/useData"
import { usePermissions } from "@/hooks/usePermissions"
import { useBabyStore } from "@/stores/babyStore"
import { BabyProfileCard } from "@/components/dashboard/BabyProfileCard"
import { SleepTimer } from "@/components/sleep/sleep-timer"
import { SleepStats } from "@/components/sleep/sleep-stats"
import { SleepHistory } from "@/components/sleep/sleep-history"
import { SleepForm } from "@/components/sleep/sleep-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PageLoading } from "@/components/ui/page-loading"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"
import { AccessDenied } from "@/components/ui/access-denied"
import { TipsCard } from "@/components/ui/tips-card"
import { sleepTips } from "@/lib/tips-data"
import { Moon as MoonIcon } from "lucide-react"
import { isApiError } from "@/lib/api"

export default function SleepPage() {
    const { babies, isLoading } = useBabies()
    const { selectedBabyId, setSelectedBabyId } = useBabyStore()
    const { canWrite } = usePermissions()

    const effectiveId = selectedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)
    const { isError: sleepError, isLoading: sleepsLoading } = useSleeps(effectiveId)

    if (isLoading) return <PageLoading />
    if (!effectiveId) return <div className="p-8 text-center text-gray-500">赤ちゃんが登録されていません</div>

    const babiesWithStrId = babies?.map((b) => ({ ...b, id: String(b.id) })) ?? []
    const isAccessDenied = isApiError(sleepError) && sleepError.status === 403

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors">
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-center h-14 px-4 max-w-2xl mx-auto">
                    <h1 className="text-base font-semibold text-gray-800 dark:text-zinc-100 flex items-center gap-1.5">
                        <MoonIcon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                        睡眠記録
                    </h1>
                </div>
            </header>

            <main className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-24">
                <BabyProfileCard
                    babies={babiesWithStrId}
                    selectedBabyId={effectiveId}
                    onSelect={(id) => setSelectedBabyId(id)}
                />

                {isAccessDenied ? (
                    <AccessDenied />
                ) : sleepsLoading ? (
                    <div className="flex justify-center py-12">
                        <BabyBottleLoading className="w-12 h-12 text-indigo-400" />
                    </div>
                ) : (
                    <>
                        <SleepStats babyId={effectiveId} />

                        <TipsCard {...sleepTips} />

                        <div className="grid gap-6">
                            {canWrite && (
                                <>
                                    <SleepTimer babyId={effectiveId} />
                                    <SleepForm babyId={effectiveId} />
                                </>
                            )}
                            <SleepHistory babyId={effectiveId} canWrite={canWrite} />
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
