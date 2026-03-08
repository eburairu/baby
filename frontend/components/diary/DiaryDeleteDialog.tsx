"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>育児日誌を削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                        {dateLabel} の育児日誌を削除します。この操作は元に戻せません。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        削除
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
