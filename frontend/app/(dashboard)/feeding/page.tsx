"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Baby as BabyIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useBabies } from "@/hooks/useData"
import { useFeeding } from "@/hooks/useFeeding"
import { usePermissions } from "@/hooks/usePermissions"
import { useBabyStore } from "@/stores/babyStore"
import { FeedingStats } from "@/components/feeding/feeding-stats"
import { FeedingForm } from "@/components/feeding/feeding-form"
import { FeedingHistory } from "@/components/feeding/feeding-history"
import { PageLoading } from "@/components/ui/page-loading"
import { AccessDenied } from "@/components/ui/access-denied"
import { TipsCard } from "@/components/ui/tips-card"
import { feedingTips } from "@/lib/tips-data"
import { isApiError } from "@/lib/api"

export default function FeedingPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const commentRecordId = searchParams.get("comment")
    const { babies, isLoading: babiesLoading } = useBabies()
    const { selectedBabyId } = useBabyStore()
    const { canWrite } = usePermissions()

    // Default to first baby, prefer store selection
    const effectiveBabyIdStr = selectedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)
    const babyId = effectiveBabyIdStr ? parseInt(effectiveBabyIdStr, 10) : null

    const {
        feedings,
        loading: feedingLoading,
        error: feedingError,
        summary,
        addFeeding,
        deleteFeeding,
        refresh: refreshFeedings,
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
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 transition-colors">
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-center h-14 px-4 max-w-2xl mx-auto">
                    <h1 className="text-base font-semibold text-gray-800 dark:text-zinc-100 flex items-center gap-1.5">
                        <BabyIcon className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                        授乳記録
                    </h1>
                </div>
            </header>

            <div className="max-w-2xl mx-auto p-4 space-y-6">
                {isAccessDenied ? (
                    <AccessDenied />
                ) : (
                    <>
                        <FeedingStats summary={summary} />

                        <TipsCard {...feedingTips} />

                        {canWrite && <FeedingForm babyId={babyId} onAdd={addFeeding} />}

                        <FeedingHistory
                            feedings={feedings || []}
                            onDelete={deleteFeeding}
                            onRefresh={refreshFeedings}
                            canWrite={canWrite}
                            initialCommentRecordId={commentRecordId ? parseInt(commentRecordId, 10) : null}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
