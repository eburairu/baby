"use client"

import { useBabies } from "@/hooks/useData"
import { useBabyStore } from "@/stores/babyStore"
import { BabyProfileCard } from "@/components/dashboard/BabyProfileCard"
import { SleepTimer } from "@/components/sleep/sleep-timer"
import { SleepStats } from "@/components/sleep/sleep-stats"
import { SleepHistory } from "@/components/sleep/sleep-history"
import { SleepForm } from "@/components/sleep/sleep-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PageLoading } from "@/components/ui/page-loading"
import { ChevronLeft, Moon as MoonIcon } from "lucide-react"

export default function SleepPage() {
    const { babies, isLoading } = useBabies()
    const { selectedBabyId, setSelectedBabyId } = useBabyStore()

    const effectiveId = selectedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)

    if (isLoading) return <PageLoading />
    if (!effectiveId) return <div className="p-8 text-center text-gray-500">赤ちゃんが登録されていません</div>

    const babiesWithStrId = babies ? babies.map((b: any) => ({ ...b, id: String(b.id) })) : []

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
                <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-1 text-gray-600 hover:text-gray-900 -ml-2 rounded-lg">
                            <ChevronLeft className="h-4 w-4" />
                            <span className="text-sm">ダッシュボード</span>
                        </Button>
                    </Link>
                    <h1 className="text-base font-semibold text-gray-800 flex items-center gap-1.5">
                        <MoonIcon className="h-4 w-4 text-indigo-500" />
                        睡眠記録
                    </h1>
                    <div className="w-16" />
                </div>
            </header>

            <main className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-24">
                <BabyProfileCard
                    babies={babiesWithStrId}
                    selectedBabyId={effectiveId}
                    onSelect={(id) => setSelectedBabyId(id)}
                />

                <SleepStats babyId={effectiveId} />

                <div className="grid gap-6">
                    <SleepTimer babyId={effectiveId} />
                    <SleepForm babyId={effectiveId} />
                    <SleepHistory babyId={effectiveId} />
                </div>
            </main>
        </div>
    )
}
