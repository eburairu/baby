"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useBabies, useDiapers } from "@/hooks/useData"
import { usePermissions } from "@/hooks/usePermissions"
import { useBabyStore } from "@/stores/babyStore"
import { DiaperStats } from "@/components/diaper/DiaperStats"
import { DiaperForm } from "@/components/diaper/DiaperForm"
import { DiaperHistory } from "@/components/diaper/DiaperHistory"
import { Diaper } from "@/types/diaper"
import { PageLoading } from "@/components/ui/page-loading"
import { AccessDenied } from "@/components/ui/access-denied"
import { TipsCard } from "@/components/ui/tips-card"
import { diaperTips } from "@/lib/tips-data"
import { Smile, Droplets } from "lucide-react"
import Link from "next/link"
import { isApiError } from "@/lib/api"

export default function DiaperPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const paramBabyId = searchParams.get("baby_id")
    const { canWrite } = usePermissions()

    const { babies, isLoading: babiesLoading } = useBabies()
    const { selectedBabyId } = useBabyStore()

    // Determine effective baby ID
    // Priority: URL param > store selection > first baby
    const effectiveBabyId = paramBabyId ?? selectedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)

    const { diapers, isLoading: diapersLoading, isError: diaperError, mutate } = useDiapers(effectiveBabyId)

    if (babiesLoading) return <PageLoading />
    if (!effectiveBabyId) return <div className="p-4 text-center mt-10">赤ちゃんが登録されていません</div>

    const isAccessDenied = isApiError(diaperError) && diaperError.status === 403

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 transition-colors">
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-center h-14 px-4 max-w-2xl mx-auto">
                    <h1 className="text-base font-semibold text-gray-800 dark:text-zinc-100 flex items-center gap-1.5">
                        <Smile className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                        おむつ記録
                    </h1>
                </div>
            </header>

            <main className="p-4 max-w-2xl mx-auto space-y-6">
                {isAccessDenied ? (
                    <AccessDenied />
                ) : (
                    <>
                        <DiaperStats diapers={diapers || []} />

                        <TipsCard {...diaperTips} />

                        {canWrite && (
                            <DiaperForm
                                babyId={effectiveBabyId}
                                onSuccess={() => mutate()}
                            />
                        )}

                        <DiaperHistory
                            diapers={diapers || []}
                            onDeleteSuccess={() => mutate()}
                            canWrite={canWrite}
                        />
                    </>
                )}
            </main>
        </div>
    )
}
