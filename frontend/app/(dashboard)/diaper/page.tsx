"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useBabies, useDiapers } from "@/hooks/useData"
import { useBabyStore } from "@/stores/babyStore"
import { DiaperStats } from "@/components/diaper/DiaperStats"
import { DiaperForm } from "@/components/diaper/DiaperForm"
import { DiaperHistory } from "@/components/diaper/DiaperHistory"
import { Diaper } from "@/types/diaper"
import { PageLoading } from "@/components/ui/page-loading"
import { AccessDenied } from "@/components/ui/access-denied"
import { ChevronLeft, Smile, Droplets } from "lucide-react"
import Link from "next/link"

export default function DiaperPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const paramBabyId = searchParams.get("baby_id")

    const { babies, isLoading: babiesLoading } = useBabies()
    const { selectedBabyId } = useBabyStore()

    // Determine effective baby ID
    // Priority: URL param > store selection > first baby
    const effectiveBabyId = paramBabyId ?? selectedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)

    const { diapers, isLoading: diapersLoading, isError: diaperError, mutate } = useDiapers(effectiveBabyId)

    if (babiesLoading) return <PageLoading />
    if (!effectiveBabyId) return <div className="p-4 text-center mt-10">赤ちゃんが登録されていません</div>

    const isAccessDenied = (diaperError as any)?.status === 403

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
                        <Smile className="h-4 w-4 text-amber-500" />
                        おむつ記録
                    </h1>
                    <div className="w-16" />
                </div>
            </header>

            <main className="p-4 max-w-2xl mx-auto space-y-6">
                {isAccessDenied ? (
                    <AccessDenied />
                ) : (
                    <>
                        <DiaperStats diapers={(diapers as unknown as Diaper[]) || []} />

                        <DiaperForm
                            babyId={effectiveBabyId}
                            onSuccess={() => mutate()}
                        />

                        <DiaperHistory
                            diapers={(diapers as unknown as Diaper[]) || []}
                            onDeleteSuccess={() => mutate()}
                        />
                    </>
                )}
            </main>
        </div>
    )
}
