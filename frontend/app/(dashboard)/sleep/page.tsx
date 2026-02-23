"use client"

import { useSleeps } from "@/hooks/useData"
import { useRecordPage } from "@/hooks/useRecordPage"
import { BabyProfileCard } from "@/components/dashboard/BabyProfileCard"
import { SleepTimer } from "@/components/sleep/sleep-timer"
import { SleepStats } from "@/components/sleep/sleep-stats"
import { SleepHistory } from "@/components/sleep/sleep-history"
import { SleepForm } from "@/components/sleep/sleep-form"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"
import { TipsCard } from "@/components/ui/tips-card"
import { sleepTips } from "@/lib/tips-data"
import { Moon as MoonIcon } from "lucide-react"
import { RecordPageLayout } from "@/components/ui/record-page-layout"

/**
 * 睡眠記録ページ
 */
export default function SleepPage() {
    const {
        babyId,
        babies,
        isLoading: babiesLoading,
        canWrite,
        commentRecordId,
    } = useRecordPage()

    const { isError: sleepError, isLoading: sleepsLoading, mutate: refreshSleeps } = useSleeps(babyId ?? null)

    const babiesWithStrId = babies?.map((b) => ({ ...b, id: String(b.id) })) ?? []

    const handleRefresh = async () => {
        await refreshSleeps()
    }

    return (
        <RecordPageLayout
            title="睡眠記録"
            icon={MoonIcon}
            iconColorClass="text-indigo-500 dark:text-indigo-400"
            isLoading={babiesLoading}
            apiError={sleepError}
            babyId={babyId}
            onRefresh={handleRefresh}
        >
            <BabyProfileCard
                babies={babiesWithStrId}
                selectedBabyId={babyId!}
            />

            {sleepsLoading ? (
                <div className="flex justify-center py-12">
                    <BabyBottleLoading className="w-12 h-12 text-indigo-400" />
                </div>
            ) : (
                <>
                    <SleepStats babyId={babyId!} />

                    <TipsCard {...sleepTips} />

                    <div className="grid gap-6">
                        {canWrite && (
                            <>
                                <SleepTimer babyId={babyId!} />
                                <SleepForm babyId={babyId!} />
                            </>
                        )}
                        <SleepHistory
                            babyId={babyId!}
                            canWrite={canWrite}
                            initialCommentRecordId={commentRecordId ?? null}
                        />
                    </div>
                </>
            )}
        </RecordPageLayout>
    )
}
