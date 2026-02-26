"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ContractionRecord } from "@/types/contraction"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { useContractionActions } from "@/hooks/useContractionActions"
import { useRecordDelete } from "@/hooks/useRecordDelete"
import { useRecordComments } from "@/hooks/useRecordComments"
import { api } from "@/lib/api"
import { ContractionHistoryItem } from "./ContractionHistoryItem"
import { ContractionEditDialog } from "./ContractionEditDialog"


interface ContractionHistoryProps {
    contractions: ContractionRecord[]
    onDeleted: () => void
    onUpdated?: () => void
    canWrite?: boolean
    initialCommentRecordId?: number | null
}

export default function ContractionHistory({ contractions, onDeleted, onUpdated, canWrite = true, initialCommentRecordId }: ContractionHistoryProps) {
    // Custom Hook logic
    const {
        editTarget,
        isUpdating,
        openEditDialog, closeEditDialog, executeUpdate,
    } = useContractionActions({
        onUpdated
    })

    const handleDelete = async (id: number) => {
        await api.delete(`/contractions/${id}`)
        onDeleted?.()
    }

    const { setDeleteTargetId, ConfirmDeleteDialog } = useRecordDelete({
        onDelete: handleDelete,
        resourceName: "陣痛記録"
    })

    const { openComment, CommentDialog } = useRecordComments({
        records: contractions,
        recordType: "contraction",
        initialCommentRecordId,
        getTitle: (record) => `陣痛 ${format(new Date(record.start_time), "yyyy/MM/dd HH:mm", { locale: ja })}`,
        onCommentChange: onDeleted
    })

    if (contractions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">陣痛記録</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-6">
                        まだ記録がありません。上のボタンで計測を開始してください。
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">陣痛記録</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {contractions.map((record) => (
                            <ContractionHistoryItem
                                key={record.id}
                                record={record}
                                canWrite={canWrite}
                                onEdit={openEditDialog}
                                onDelete={setDeleteTargetId}
                                onComment={openComment}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            <ConfirmDeleteDialog />
            <CommentDialog />

            <ContractionEditDialog
                record={editTarget}
                isOpen={editTarget !== null}
                onClose={closeEditDialog}
                onUpdate={executeUpdate}
                isUpdating={isUpdating}
            />
        </>
    )
}
