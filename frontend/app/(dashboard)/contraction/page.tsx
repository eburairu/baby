"use client"

import { useSearchParams } from "next/navigation"
import { useBabies, useContractions } from "@/hooks/useData"
import { usePermissions } from "@/hooks/usePermissions"
import { useBabyStore } from "@/stores/babyStore"
import ContractionTimer from "@/components/ContractionTimer"
import ContractionStats from "@/components/ContractionStats"
import ContractionHistory from "@/components/ContractionHistory"
import ContractionWaveGraph from "@/components/ContractionWaveGraph"
import { Button } from "@/components/ui/button"
import type { ContractionRecord } from "@/types/contraction"
import { PageLoading } from "@/components/ui/page-loading"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"
import { AccessDenied } from "@/components/ui/access-denied"
import { TipsCard } from "@/components/ui/tips-card"
import { contractionTips } from "@/lib/tips-data"
import { Timer } from "lucide-react"
import Link from "next/link"
import { isApiError } from "@/lib/api"

export default function ContractionPage() {
    const searchParams = useSearchParams()
    const commentRecordId = searchParams.get("comment")
    const commentBabyId = searchParams.get("baby_id")
    const { babies, isLoading: babiesLoading } = useBabies()
    const { selectedBabyId: storedBabyId, setSelectedBabyId: setStoredBabyId } = useBabyStore()
    const { canWrite } = usePermissions()

    // baby_id from URL takes priority (e.g. from notification link)
    const effectiveIdStr = commentBabyId ?? storedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)
    const selectedBabyId = effectiveIdStr ? parseInt(effectiveIdStr, 10) : null

    const { contractions, isLoading: contractionsLoading, isError: contractionError, mutate } = useContractions(selectedBabyId)

    const handleRecorded = () => mutate()
    const handleDeleted = () => mutate()
    const handleUpdated = () => mutate()

    if (babiesLoading) {
        return <PageLoading />
    }

    if (!babies || babies.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                赤ちゃんが登録されていません。ダッシュボードから登録してください。
            </div>
        )
    }

    const isAccessDenied = isApiError(contractionError) && contractionError.status === 403
    const typedContractions: ContractionRecord[] = contractions ?? []

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors">
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-center h-14 px-4 max-w-2xl mx-auto">
                    <h1 className="text-base font-semibold text-gray-800 dark:text-zinc-100 flex items-center gap-1.5">
                        <Timer className="h-4 w-4 text-red-500 dark:text-red-400" />
                        陣痛タイマー
                    </h1>
                </div>
            </header>

            <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
                {isAccessDenied ? (
                    <AccessDenied />
                ) : (
                    <>
                        {/* Baby選択 */}
                        {babies.length > 1 && (
                            <div className="flex gap-2">
                                {babies.map((baby: { id: number; name: string }) => (
                                    <Button
                                        key={baby.id}
                                        variant={selectedBabyId === baby.id ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setStoredBabyId(String(baby.id))}
                                        className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"
                                    >
                                        {baby.name}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* 統計 */}
                        <ContractionStats contractions={typedContractions} />

                        <TipsCard {...contractionTips} />

                        {/* タイマー */}
                        {selectedBabyId && canWrite && (
                            <ContractionTimer
                                babyId={selectedBabyId}
                                onRecorded={handleRecorded}
                                lastContraction={typedContractions[0]} // 最新の記録（降順なので[0]）
                            />
                        )}

                        {/* グラフ（2件以上の記録がある場合のみ表示） */}
                        {typedContractions.length >= 2 && (
                            <ContractionWaveGraph contractions={typedContractions} />
                        )}

                        {/* 履歴 */}
                        {contractionsLoading ? (
                            <div className="flex justify-center py-4">
                                <BabyBottleLoading className="w-8 h-8 text-red-400" />
                            </div>
                        ) : (
                            <ContractionHistory
                                contractions={typedContractions}
                                onDeleted={handleDeleted}
                                onUpdated={handleUpdated}
                                canWrite={canWrite}
                                initialCommentRecordId={commentRecordId ? parseInt(commentRecordId, 10) : null}
                            />
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
