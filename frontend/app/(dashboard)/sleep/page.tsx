"use client"

import { useState } from "react"
import { useBabies } from "@/hooks/useData"
import { BabyProfileCard } from "@/components/dashboard/BabyProfileCard"
import { SleepTimer } from "@/components/sleep/sleep-timer"
import { SleepStats } from "@/components/sleep/sleep-stats"
import { SleepHistory } from "@/components/sleep/sleep-history"
import { SleepForm } from "@/components/sleep/sleep-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SleepPage() {
    const { babies, isLoading } = useBabies()
    const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null)

    const effectiveId = selectedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)

    if (isLoading) return <div className="p-8 text-center text-gray-500">読み込み中...</div>
    if (!effectiveId) return <div className="p-8 text-center text-gray-500">赤ちゃんが登録されていません</div>

    const babiesWithStrId = babies.map((b: any) => ({ ...b, id: String(b.id) }))

    return (
        <div className="container mx-auto max-w-2xl p-4 space-y-6 pb-24">
            <div className="flex items-center gap-2 mb-4">
                <h1 className="text-xl font-bold text-gray-800">睡眠記録</h1>
            </div>

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
        </div>
    )
}
