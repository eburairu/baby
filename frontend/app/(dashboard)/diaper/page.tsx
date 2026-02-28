"use client"

import { useDiapers } from "@/hooks/useDiaper"
import { useRecordPage } from "@/hooks/useRecordPage"
import { DiaperStats } from "@/components/diaper/DiaperStats"
import { DiaperForm } from "@/components/diaper/DiaperForm"
import { DiaperHistory } from "@/components/diaper/DiaperHistory"
import { TipsCard } from "@/components/ui/tips-card"
import { diaperTips } from "@/lib/tips-data"
import { Smile } from "lucide-react"
import { RecordPageLayout } from "@/components/ui/record-page-layout"

/**
 * おむつ記録ページ
 */
export default function DiaperPage() {
    const {
        babyId,
        isLoading: babiesLoading,
        canWrite,
        triggerFeedback,
        commentRecordId,
    } = useRecordPage()

    const { diapers, isLoading: diapersLoading, isError: diaperError, mutate } = useDiapers(babyId ?? null)

    const handleRefresh = async () => {
        await mutate()
    }

    return (
        <RecordPageLayout
            title="おむつ記録"
            icon={Smile}
            iconColorClass="text-amber-500 dark:text-amber-400"
            isLoading={babiesLoading}
            isDataLoading={diapersLoading}
            apiError={diaperError}
            babyId={babyId}
            onRefresh={handleRefresh}
        >
            <DiaperStats diapers={diapers || []} />

            <TipsCard {...diaperTips} />

            {canWrite && babyId && (
                <DiaperForm
                    babyId={babyId}
                    onSuccess={(recordId) => {
                        mutate()
                        if (recordId) triggerFeedback("diaper", recordId)
                    }}
                />
            )}

            <DiaperHistory
                diapers={diapers || []}
                onDeleteSuccess={() => mutate()}
                canWrite={canWrite}
                initialCommentRecordId={commentRecordId ?? null}
            />
        </RecordPageLayout>
    )
}
