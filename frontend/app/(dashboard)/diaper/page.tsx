"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useBabies, useDiapers } from "@/hooks/useData"
import { DiaperStats } from "@/components/diaper/DiaperStats"
import { DiaperForm } from "@/components/diaper/DiaperForm"
import { DiaperHistory } from "@/components/diaper/DiaperHistory"
import { Diaper } from "@/types/diaper"

export default function DiaperPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const paramBabyId = searchParams.get("baby_id")

    const { babies, isLoading: babiesLoading } = useBabies()

    // Determine effective baby ID
    // If param exists, use it. Otherwise use first baby.
    const effectiveBabyId = paramBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)

    const { diapers, isLoading: diapersLoading, mutate } = useDiapers(effectiveBabyId)

    if (babiesLoading) return <div className="p-4 text-gray-500 text-center mt-10">読み込み中...</div>
    if (!effectiveBabyId) return <div className="p-4 text-center mt-10">赤ちゃんが登録されていません</div>

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-white px-4 py-3 sticky top-0 z-10 shadow-sm">
                <h1 className="text-lg font-bold text-gray-800">おむつ交換</h1>
            </header>

            <main className="p-4 max-w-lg mx-auto space-y-4">
                <DiaperStats diapers={(diapers as unknown as Diaper[]) || []} />

                <DiaperForm
                    babyId={effectiveBabyId}
                    onSuccess={() => mutate()}
                />

                <DiaperHistory
                    diapers={(diapers as unknown as Diaper[]) || []}
                    onDeleteSuccess={() => mutate()}
                />
            </main>
        </div>
    )
}
