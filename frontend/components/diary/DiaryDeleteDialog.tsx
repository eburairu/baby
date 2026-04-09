"use client"

import { ConfirmAlertDialog } from "@/components/ui/confirm-alert-dialog"
import { DailySummary } from "@/types/dailySummary"

interface DiaryDeleteDialogProps {
    summary: DailySummary | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (summaryDate: string) => Promise<void>
}

export function DiaryDeleteDialog({ summary, open, onOpenChange, onConfirm }: DiaryDeleteDialogProps) {
    const dateLabel = summary
        ? new Date(summary.summary_date + "T00:00:00").toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : ""

    const handleConfirm = async () => {
        if (!summary) return
        await onConfirm(summary.summary_date)
        onOpenChange(false)
    }

    return (
        <ConfirmAlertDialog
            open={open}
            onOpenChange={onOpenChange}
            title="育児日誌を削除しますか？"
            description={`${dateLabel} の育児日誌を削除します。この操作は元に戻せません。`}
            confirmText="削除"
            onConfirm={handleConfirm}
            confirmButtonClass="bg-red-500 hover:bg-red-600"
        />
    )
}
