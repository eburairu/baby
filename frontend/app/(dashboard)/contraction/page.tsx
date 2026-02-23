"use client"

import { useContractions } from "@/hooks/useData"
import { useRecordPage } from "@/hooks/useRecordPage"
import ContractionTimer from "@/components/ContractionTimer"
import ContractionStats from "@/components/ContractionStats"
import ContractionHistory from "@/components/ContractionHistory"
import ContractionWaveGraph from "@/components/ContractionWaveGraph"
import type { ContractionRecord } from "@/types/contraction"
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

    const numericBabyId = babyId ? parseInt(babyId, 10) : undefined
    const { contractions, isLoading: contractionsLoading, isError: contractionError, mutate } = useContractions(numericBabyId ?? null)

    const handleRefresh = async () => {
        await mutate()
    }

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
                isDataLoading={contractionsLoading}
                apiError={contractionError}
                babyId={babyId}
                onRefresh={handleRefresh}
            >
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
                <ContractionHistory
                    contractions={typedContractions}
                    onDeleted={handleDeleted}
                    onUpdated={handleUpdated}
                    canWrite={canWrite}
                    initialCommentRecordId={commentRecordId ?? null}
                />
            </RecordPageLayout>
        )
    }
    
