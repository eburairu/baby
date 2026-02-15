"use client"

import { useBabies, useContractions } from "@/hooks/useData"
import { usePermissions } from "@/hooks/usePermissions"
import { useBabyStore } from "@/stores/babyStore"
import ContractionTimer from "@/components/ContractionTimer"
import ContractionStats from "@/components/ContractionStats"
import ContractionHistory from "@/components/ContractionHistory"
import ContractionGraph from "@/components/ContractionGraph"
import { Button } from "@/components/ui/button"
import type { ContractionRecord } from "@/types/contraction"
import { PageLoading } from "@/components/ui/page-loading"
import { AccessDenied } from "@/components/ui/access-denied"
import { Timer } from "lucide-react"
import Link from "next/link"
import { isApiError } from "@/lib/api"

export default function ContractionPage() {
    const { babies, isLoading: babiesLoading } = useBabies()
    const { selectedBabyId: storedBabyId, setSelectedBabyId: setStoredBabyId } = useBabyStore()
    const { canWrite } = usePermissions()

    // ストアの文字列IDを数値に変換、未選択時は最初の赤ちゃんをフォールバック
    const effectiveIdStr = storedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)
    const selectedBabyId = effectiveIdStr ? parseInt(effectiveIdStr, 10) : null

    const { contractions, isLoading: contractionsLoading, isError: contractionError, mutate } = useContractions(selectedBabyId)

    const handleRecorded = () => mutate()
    const handleDeleted = () => mutate()

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
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
                <div className="flex items-center justify-center h-14 px-4 max-w-2xl mx-auto">
                    <h1 className="text-base font-semibold text-gray-800 flex items-center gap-1.5">
                        <Timer className="h-4 w-4 text-red-500" />
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
                                    >
                                        {baby.name}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* 統計 */}
                        <ContractionStats contractions={typedContractions} />

                        {/* タイマー */}
                        {selectedBabyId && canWrite && (
                            <ContractionTimer
                                babyId={selectedBabyId}
                                onRecorded={handleRecorded}
                            />
                        )}

                        {/* グラフ（2件以上の記録がある場合のみ表示） */}
                        {typedContractions.length >= 2 && (
                            <ContractionGraph contractions={typedContractions} />
                        )}

                        {/* 履歴 */}
                        {contractionsLoading ? (
                            <div className="text-center py-4 text-muted-foreground">記録を読み込み中...</div>
                        ) : (
                            <ContractionHistory
                                contractions={typedContractions}
                                onDeleted={handleDeleted}
                                canWrite={canWrite}
                            />
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
