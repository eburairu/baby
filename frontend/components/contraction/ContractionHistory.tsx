"use client"

import { HistoryCard } from "@/components/records/HistoryCard"
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

    return (
        <>
            <HistoryCard
                title="陣痛記録"
                isEmpty={contractions.length === 0}
                emptyMessage="まだ記録がありません。上のボタンで計測を開始してください。"
            >
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
            </HistoryCard>

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
