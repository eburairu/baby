"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ConfirmAlertDialog } from "@/components/ui/confirm-alert-dialog"

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
        <ConfirmAlertDialog
            open={deleteTargetId !== null}
            onOpenChange={(open) => { if (!open) setDeleteTargetId(null) }}
            title={<span data-sentry-unmask>記録の削除</span>}
            description={<span data-sentry-unmask>この{resourceName}を削除しますか？この操作は取り消せません。</span>}
            confirmText="削除"
            onConfirm={handleDelete}
            loading={isDeleting}
            confirmButtonClass="bg-red-600 hover:bg-red-700"
            cancelButtonProps={{ "data-sentry-unmask": true } as React.ComponentProps<"button">}
            confirmButtonProps={{ "data-sentry-unmask": true } as React.ComponentProps<"button">}
        />
    )

    return {
        deleteTargetId,
        setDeleteTargetId,
        isDeleting,
        handleDelete,
        ConfirmDeleteDialog
    }
}
