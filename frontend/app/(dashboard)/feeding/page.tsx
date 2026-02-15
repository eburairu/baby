"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Baby as BabyIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useBabies } from "@/hooks/useData"
import { useFeeding } from "@/hooks/useFeeding"
import { useBabyStore } from "@/stores/babyStore"
import { FeedingStats } from "@/components/feeding/feeding-stats"
import { FeedingForm } from "@/components/feeding/feeding-form"
import { FeedingHistory } from "@/components/feeding/feeding-history"
import { PageLoading } from "@/components/ui/page-loading"
import { AccessDenied } from "@/components/ui/access-denied"
import { isApiError } from "@/lib/api"

export default function FeedingPage() {
    const router = useRouter()
    const { babies, isLoading: babiesLoading } = useBabies()
    const { selectedBabyId } = useBabyStore()

    // Default to first baby, prefer store selection
    const effectiveBabyIdStr = selectedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)
    const babyId = effectiveBabyIdStr ? parseInt(effectiveBabyIdStr, 10) : null

    const {
        feedings,
        loading: feedingLoading,
        error: feedingError,
        summary,
        addFeeding,
        deleteFeeding
    } = useFeeding(babyId)

    if (babiesLoading) {
        return <PageLoading />
    }

    if (!babyId) {
        return (
            <div className="p-4 text-center">
                <p>赤ちゃんが登録されていません。</p>
            </div>
        )
    }

    const isAccessDenied = isApiError(feedingError) && feedingError.status === 403

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
                <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-1 text-gray-600 hover:text-gray-900 -ml-2 rounded-lg">
                            <ChevronLeft className="h-4 w-4" />
                            <span className="text-sm">ダッシュボード</span>
                        </Button>
                    </Link>
                    <h1 className="text-base font-semibold text-gray-800 flex items-center gap-1.5">
                        <BabyIcon className="h-4 w-4 text-rose-500" />
                        授乳記録
                    </h1>
                    <div className="w-16" />
                </div>
            </header>

            <div className="max-w-2xl mx-auto p-4 space-y-6">
                {isAccessDenied ? (
                    <AccessDenied />
                ) : (
                    <>
                        <FeedingStats summary={summary} />

                        <FeedingForm babyId={babyId} onAdd={addFeeding} />

                        <FeedingHistory
                            feedings={feedings || []}
                            onDelete={deleteFeeding}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
