"use client"

import { useContractions } from "@/hooks/useData"
import { useRecordPage } from "@/hooks/useRecordPage"
import { useBabyStore } from "@/stores/babyStore"
import ContractionTimer from "@/components/ContractionTimer"
import ContractionStats from "@/components/ContractionStats"
import ContractionHistory from "@/components/ContractionHistory"
import ContractionWaveGraph from "@/components/ContractionWaveGraph"
import { Button } from "@/components/ui/button"
import type { ContractionRecord } from "@/types/contraction"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"
import { TipsCard } from "@/components/ui/tips-card"
import { contractionTips } from "@/lib/tips-data"
import { Timer } from "lucide-react"
import { RecordPageLayout } from "@/components/ui/record-page-layout"

/**
 * 陣痛タイマーページ
 */
export default function ContractionPage() {
    const {
        babyId,
        babies,
        isLoading: babiesLoading,
        canWrite,
        commentRecordId,
    } = useRecordPage()

    const { setSelectedBabyId: setStoredBabyId } = useBabyStore()

    const numericBabyId = babyId ? parseInt(babyId, 10) : undefined
    const { contractions, isLoading: contractionsLoading, isError: contractionError, mutate } = useContractions(numericBabyId ?? null)

    const handleRecorded = () => mutate()
    const handleDeleted = () => mutate()
    const handleUpdated = () => mutate()

    const typedContractions: ContractionRecord[] = contractions ?? []

    return (
        <RecordPageLayout
            title="陣痛タイマー"
            icon={Timer}
            iconColorClass="text-red-500 dark:text-red-400"
            isLoading={babiesLoading}
            apiError={contractionError}
            babyId={babyId}
        >
            {/* Baby選択 */}
            {babies && babies.length > 1 && (
                <div className="flex gap-2">
                    {babies.map((baby: { id: number; name: string }) => (
                        <Button
                            key={baby.id}
                            variant={numericBabyId === baby.id ? "default" : "outline"}
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
            {numericBabyId && canWrite && (
                <ContractionTimer
                    babyId={numericBabyId}
                    onRecorded={handleRecorded}
                    lastContraction={typedContractions[0]}
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
                    initialCommentRecordId={commentRecordId ?? null}
                />
            )}
        </RecordPageLayout>
    )
}
