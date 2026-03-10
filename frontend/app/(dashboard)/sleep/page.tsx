"use client"
import { AppIcons } from "@/constants/icons"

import { useSleeps } from "@/hooks/useSleep"
import { useRecordPage } from "@/hooks/useRecordPage"
import { SleepTimer } from "@/components/sleep/sleep-timer"
import { SleepStats } from "@/components/sleep/sleep-stats"
import { SleepChart } from "@/components/sleep/SleepChart"
import { SleepHistory } from "@/components/sleep/sleep-history"
import { SleepCreateDialog } from "@/components/sleep/SleepCreateDialog"
import { TipsCard } from "@/components/ui/tips-card"
import { sleepTips } from "@/lib/tips-data"
import { RecordPageLayout } from "@/components/ui/record-page-layout"

/**
 * 睡眠記録ページ
 */
export default function SleepPage() {
    const {
        babyId,
        isLoading: babiesLoading,
        canWrite,
        commentRecordId,
    } = useRecordPage()

    const { sleeps, isError: sleepError, isLoading: sleepsLoading, mutate: refreshSleeps } = useSleeps(babyId ?? null)

    const handleRefresh = async () => {
        await refreshSleeps()
    }

    return (
        <RecordPageLayout
            title="睡眠記録"
            icon={AppIcons.sleep}
            iconColorClass="text-indigo-500 dark:text-indigo-400"
            isLoading={babiesLoading}
            isDataLoading={sleepsLoading}
            apiError={sleepError}
            babyId={babyId}
            onRefresh={handleRefresh}
        >
            <SleepStats babyId={babyId!} />

            <SleepChart sleeps={sleeps ?? []} />

            <TipsCard {...sleepTips} />

            <div className="grid gap-6">
                {canWrite && (
                    <>
                        <SleepTimer babyId={babyId!} />
                        <SleepCreateDialog babyId={babyId!} />
                    </>
                )}
                <SleepHistory
                    babyId={babyId!}
                    canWrite={canWrite}
                    initialCommentRecordId={commentRecordId ?? null}
                />
            </div>
        </RecordPageLayout>
    )
}
