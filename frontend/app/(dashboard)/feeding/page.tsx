"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useBabies } from "@/hooks/useData"
import { useFeeding } from "@/hooks/useFeeding"
import { FeedingStats } from "@/components/feeding/feeding-stats"
import { FeedingForm } from "@/components/feeding/feeding-form"
import { FeedingHistory } from "@/components/feeding/feeding-history"

export default function FeedingPage() {
    const router = useRouter()
    const { babies, isLoading: babiesLoading } = useBabies()

    // Default to first baby
    const babyId = babies && babies.length > 0 ? babies[0].id : null

    const {
        feedings,
        loading: feedingLoading,
        summary,
        addFeeding,
        deleteFeeding
    } = useFeeding(babyId)

    if (babiesLoading) {
        return <div className="p-4 text-center text-gray-500">読み込み中...</div>
    }

    if (!babyId) {
        <div className="p-4 text-center">
            <p>赤ちゃんが登録されていません。</p>
        </div>
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
                    <h1 className="text-lg font-bold">授乳記録</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4 space-y-6">
                <FeedingStats summary={summary} />

                <FeedingForm babyId={babyId} onAdd={addFeeding} />

                <FeedingHistory
                    feedings={feedings || []}
                    onDelete={deleteFeeding}
                />
            </div>
        </div>
    )
}
