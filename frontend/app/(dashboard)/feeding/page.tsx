"use client"
import { AppIcons } from "@/constants/icons"

import { useFeeding } from "@/hooks/useFeeding"
import { useRecordPage } from "@/hooks/useRecordPage"
import { FeedingStats } from "@/components/feeding/feeding-stats"
import { FeedingChart } from "@/components/feeding/FeedingChart"
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

    // 授乳データ取得 (babyId はフック内で数値に変換される)
    const {
        feedings,
        loading: feedingsLoading,
        error: feedingError,
        summary,
        addFeeding,
        updateFeeding,
        deleteFeeding,
        refresh: refreshFeedings,
    } = useFeeding(babyId ?? null)

    const handleAddFeeding = async (data: FeedingCreate): Promise<Feeding | undefined> => {
        const newRecord = await addFeeding(data)
        if (newRecord && babyId) {
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

            <FeedingChart feedings={feedings ?? []} />

            <TipsCard {...feedingTips} />

            {canWrite && babyId && (
                <FeedingForm
                    babyId={typeof babyId === 'string' ? parseInt(babyId, 10) : (babyId || 0)}
                    onAdd={handleAddFeeding}
                    onSuccess={refreshFeedings}
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
                babyId={typeof babyId === 'string' ? parseInt(babyId, 10) : (babyId ?? undefined)}
            />
        </RecordPageLayout>
    )
}
