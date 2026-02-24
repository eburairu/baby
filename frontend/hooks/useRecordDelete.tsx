"use client"

import { useState } from "react"
import { toast } from "sonner"
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
import { Loader2 } from "lucide-react"

interface UseRecordDeleteProps {
    onDelete: (id: number) => Promise<void>
    onSuccess?: () => void
    resourceName: string
}

export function useRecordDelete({ onDelete, onSuccess, resourceName }: UseRecordDeleteProps) {
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (deleteTargetId === null) return
        setIsDeleting(true)
        try {
            await onDelete(deleteTargetId)
            toast.success("削除しました")
            if (onSuccess) onSuccess()
            setDeleteTargetId(null)
        } catch (e) {
            console.error(e)
            toast.error("削除に失敗しました")
        } finally {
            setIsDeleting(false)
        }
    }

    const ConfirmDeleteDialog = () => (
        <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => { if (!open) setDeleteTargetId(null) }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle data-sentry-unmask>記録の削除</AlertDialogTitle>
                    <AlertDialogDescription data-sentry-unmask>
                        この{resourceName}を削除しますか？この操作は取り消せません。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting} data-sentry-unmask>キャンセル</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} data-sentry-unmask className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        削除
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )

    return {
        deleteTargetId,
        setDeleteTargetId,
        isDeleting,
        handleDelete,
        ConfirmDeleteDialog
    }
}
