"use client"

import { Baby as BabyIcon } from "lucide-react"

import { useFeeding } from "@/hooks/useFeeding"
import { useRecordPage } from "@/hooks/useRecordPage"
import { FeedingStats } from "@/components/feeding/feeding-stats"
import { FeedingForm } from "@/components/feeding/feeding-form"
import { FeedingHistory } from "@/components/feeding/feeding-history"
import { TipsCard } from "@/components/ui/tips-card"
import { feedingTips } from "@/lib/tips-data"
import { FeedingCreate } from "@/types/feeding"
import { RecordPageLayout } from "@/components/ui/record-page-layout"

/**
 * 授乳記録ページ
 */
export default function FeedingPage() {
    const {
        babyId,
        isLoading: babiesLoading,
        canWrite,
        triggerFeedback,
        commentRecordId,
    } = useRecordPage()

    // 授乳データ取得 (babyId が文字列の場合があるため考慮)
    const numericBabyId = babyId ? parseInt(babyId, 10) : undefined
    const {
        feedings,
        error: feedingError,
        summary,
        addFeeding,
        updateFeeding,
        deleteFeeding,
        refresh: refreshFeedings,
    } = useFeeding(numericBabyId ?? null)

    const handleAddFeeding = async (data: FeedingCreate): Promise<void> => {
        const newRecord = await addFeeding(data)
        if (newRecord && numericBabyId) {
            triggerFeedback("feeding", newRecord.id)
        }
    }

    return (
        <RecordPageLayout
            title="授乳記録"
            icon={BabyIcon}
            iconColorClass="text-rose-500 dark:text-rose-400"
            isLoading={babiesLoading}
            apiError={feedingError}
            babyId={babyId}
            onRefresh={refreshFeedings}
        >
            <FeedingStats summary={summary} />

            <TipsCard {...feedingTips} />

            {canWrite && numericBabyId && (
                <FeedingForm babyId={numericBabyId} onAdd={handleAddFeeding} />
            )}

            <FeedingHistory
                feedings={feedings || []}
                onDelete={deleteFeeding}
                onUpdate={updateFeeding}
                onRefresh={refreshFeedings}
                canWrite={canWrite}
                initialCommentRecordId={commentRecordId}
                babyId={numericBabyId}
            />
        </RecordPageLayout>
    )
}
