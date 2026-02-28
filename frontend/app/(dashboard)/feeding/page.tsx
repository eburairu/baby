"use client"
import { AppIcons } from "@/constants/icons"


import { useFeeding } from "@/hooks/useFeeding"
import { useRecordPage } from "@/hooks/useRecordPage"
import { FeedingStats } from "@/components/feeding/feeding-stats"
import { FeedingForm } from "@/components/feeding/feeding-form"
import { FeedingHistory } from "@/components/feeding/feeding-history"
import { TipsCard } from "@/components/ui/tips-card"
import { feedingTips } from "@/lib/tips-data"
import { Feeding, FeedingCreate } from "@/types/feeding"
import { RECORD_TYPES } from "@/types/enums"
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
        loading: feedingsLoading,
        error: feedingError,
        summary,
        addFeeding,
        updateFeeding,
        deleteFeeding,
        refresh: refreshFeedings,
    } = useFeeding(numericBabyId ?? null)

    const handleAddFeeding = async (data: FeedingCreate): Promise<Feeding | undefined> => {
        const newRecord = await addFeeding(data)
        if (newRecord && numericBabyId) {
            triggerFeedback(RECORD_TYPES.FEEDING, newRecord.id)
        }
        return newRecord
    }

    return (
        <RecordPageLayout
            title="授乳記録"
            icon={AppIcons.feeding}
            iconColorClass="text-rose-500 dark:text-rose-400"
            isLoading={babiesLoading}
            isDataLoading={feedingsLoading}
            apiError={feedingError}
            babyId={babyId}
            onRefresh={refreshFeedings}
        >
            <FeedingStats summary={summary} />

            <TipsCard {...feedingTips} />

            {canWrite && numericBabyId && (
                <FeedingForm 
                    babyId={numericBabyId} 
                    onAdd={handleAddFeeding} 
                    lastMilkAmount={summary.lastMilkAmount}
                    lastBottleContentType={summary.lastBottleContentType}
                />
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
