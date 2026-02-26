"use client"

import { useState } from "react"
import { useGrowths } from "@/hooks/useData"
import { useRecordPage } from "@/hooks/useRecordPage"
import { Button } from "@/components/ui/button"
import { Plus, Ruler } from "lucide-react"
import { GrowthChart } from "@/components/growth/GrowthChart"
import { GrowthHistoryList } from "@/components/growth/GrowthHistoryList"
import { GrowthRecordForm } from "@/components/growth/GrowthRecordForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TipsCard } from "@/components/ui/tips-card"
import { growthTips } from "@/lib/tips-data"
import { Growth } from "@/types/growth"
import { RecordPageLayout } from "@/components/ui/record-page-layout"

/**
 * 成長記録ページ
 */
export default function GrowthPage() {
    const {
        babyId,
        babies,
        isLoading: babiesLoading,
        canWrite,
        triggerFeedback,
        commentRecordId,
    } = useRecordPage()

    const { growths, isLoading: growthsLoading, isError: growthError, mutate } = useGrowths(babyId ?? null)

    const handleRefresh = async () => {
        await mutate()
    }

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingRecord, setEditingRecord] = useState<Growth | null>(null)

    const handleEdit = (record: Growth) => {
        setEditingRecord(record)
        setIsFormOpen(true)
    }

    const handleAdd = () => {
        setEditingRecord(null)
        setIsFormOpen(true)
    }

    const currentBaby = babies?.find(b => String(b.id) === babyId)

    return (
        <RecordPageLayout
            title="成長記録"
            icon={Ruler}
            iconColorClass="text-emerald-500 dark:text-emerald-400"
            isLoading={babiesLoading}
            isDataLoading={growthsLoading}
            apiError={growthError}
            babyId={babyId}
            onRefresh={handleRefresh}
        >
            <TipsCard {...growthTips} />

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800 dark:text-zinc-100">数値の推移</h2>
                {canWrite && (
                    <Button onClick={handleAdd} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                        <Plus className="h-4 w-4" />
                        新しい記録
                    </Button>
                )}
            </div>

            <GrowthChart
                records={growths || []}
                babyBirthday={currentBaby?.birthday}
                babyGender={currentBaby?.gender}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">履歴</CardTitle>
                </CardHeader>
                <CardContent>
                    <GrowthHistoryList
                        records={growths || []}
                        onEdit={handleEdit}
                        onDeleteSuccess={() => mutate()}
                        canWrite={canWrite}
                        initialCommentRecordId={commentRecordId ?? null}
                    />
                </CardContent>
            </Card>

            {babyId && (
                <GrowthRecordForm
                    babyId={parseInt(babyId)}
                    record={editingRecord}
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={(recordId) => {
                        mutate()
                        if (recordId) triggerFeedback("growth", recordId)
                    }}
                />
            )}
        </RecordPageLayout>
    )
}
