"use client"

import { AppIcons } from "@/constants/icons"
import { useTemperatures } from "@/hooks/useTemperatures"
import { useRecordPage } from "@/hooks/useRecordPage"
import { TemperatureStats } from "@/components/temperature/TemperatureStats"
import { TemperatureChart } from "@/components/temperature/TemperatureChart"
import { TemperatureForm } from "@/components/temperature/TemperatureForm"
import { TemperatureHistory } from "@/components/temperature/TemperatureHistory"
import { RecordPageLayout } from "@/components/ui/record-page-layout"

/**
 * 体温記録ページ
 */
export default function TemperaturePage() {
    const {
        babyId,
        isLoading: babiesLoading,
        canWrite,
        triggerFeedback,
        commentRecordId,
    } = useRecordPage()

    const {
        temperatures,
        isLoading: temperaturesLoading,
        isError: temperatureError,
        mutate,
        deleteTemperature,
    } = useTemperatures(babyId ?? null)

    const handleRefresh = async () => {
        await mutate()
    }

    return (
        <RecordPageLayout
            title="体温記録"
            icon={AppIcons.temperature}
            iconColorClass="text-orange-500 dark:text-orange-400"
            isLoading={babiesLoading}
            isDataLoading={temperaturesLoading}
            apiError={temperatureError}
            babyId={babyId}
            onRefresh={handleRefresh}
        >
            <TemperatureStats temperatures={temperatures || []} />

            <TemperatureChart temperatures={temperatures || []} />

            {canWrite && babyId && (
                <TemperatureForm
                    babyId={babyId}
                    onSuccess={(recordId) => {
                        mutate()
                        if (recordId) triggerFeedback("temperature", recordId)
                    }}
                />
            )}

            <TemperatureHistory
                temperatures={temperatures || []}
                onDelete={deleteTemperature}
                onRefresh={handleRefresh}
                canWrite={canWrite}
                initialCommentRecordId={commentRecordId ?? null}
            />
        </RecordPageLayout>
    )
}
