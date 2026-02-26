"use client"
import { useState } from "react"
import { Diaper, DiaperType } from "@/types/diaper"
import { Droplets, Biohazard } from "lucide-react"
import { RecordMetaItems } from "@/components/records/RecordMetaItems"
import { formatDateTime } from "@/lib/dateUtils"
import { api } from "@/lib/api"
import { DiaperEditDialog } from "./DiaperEditDialog"
import { useRecordDelete } from "@/hooks/useRecordDelete"
import { HistoryCard } from "@/components/records/HistoryCard"
import { RecordListItem } from "@/components/records/RecordListItem"
import { RecordActionButtons } from "@/components/records/RecordActionButtons"
import { useRecordComments } from "@/hooks/useRecordComments"



const getStyles = (type: DiaperType) => {
    switch (type) {
        case DiaperType.WET:
            return {
                bg: "bg-blue-50 dark:bg-blue-950/30",
                border: "border-blue-100 dark:border-blue-900/50",
                text: "text-blue-700 dark:text-blue-400",
                icon: <Droplets className="w-6 h-6" />,
                label: "おしっこ"
            }
        case DiaperType.DIRTY:
            return {
                bg: "bg-amber-50 dark:bg-amber-950/30",
                border: "border-amber-100 dark:border-amber-900/50",
                text: "text-amber-700 dark:text-amber-400",
                icon: <Biohazard className="w-6 h-6" />,
                label: "うんち"
            }
        case DiaperType.BOTH:
            return {
                bg: "bg-purple-50 dark:bg-purple-950/30",
                border: "border-purple-100 dark:border-purple-900/50",
                text: "text-purple-700 dark:text-purple-400",
                icon: <span className="flex gap-0.5"><Droplets className="w-6 h-6" /><Biohazard className="w-6 h-6" /></span>,
                label: "両方"
            }
        default:
            return {
                bg: "bg-gray-50 dark:bg-zinc-800/50",
                border: "border-gray-100 dark:border-zinc-700",
                text: "text-gray-700 dark:text-zinc-400",
                icon: "?",
                label: "不明"
            }
    }
}

interface Props {
    diapers: Diaper[]
    onDeleteSuccess: () => void
    canWrite?: boolean
    initialCommentRecordId?: number | null
}

export function DiaperHistory({ diapers, onDeleteSuccess, canWrite = true, initialCommentRecordId }: Props) {
    const [editingDiaper, setEditingDiaper] = useState<Diaper | null>(null)
    const [editOpen, setEditOpen] = useState(false)

    const { setDeleteTargetId, ConfirmDeleteDialog } = useRecordDelete({
        onDelete: async (id) => {
             await api.delete(`/diapers/${id}`)
        },
        onSuccess: onDeleteSuccess,
        resourceName: "おむつ記録"
    });

    const { openComment, CommentDialog } = useRecordComments({
        records: diapers,
        recordType: "diaper",
        initialCommentRecordId,
        getTitle: (d) => {
            const style = getStyles(d.diaper_type)
            return `${style.label} ${formatDateTime(d.change_time)}`
        },
        onCommentChange: onDeleteSuccess
    });

    const handleEdit = (diaper: Diaper) => {
        setEditingDiaper(diaper)
        setEditOpen(true)
    }

    const isEmpty = !diapers || diapers.length === 0;

    return (
        <>
            <HistoryCard title="最近の記録" isEmpty={isEmpty} emptyMessage="記録がありません">
                {(diapers || []).map((diaper) => {
                    const style = getStyles(diaper.diaper_type)
                    return (
                        <RecordListItem
                            key={diaper.id}
                            className={`${style.bg} ${style.border}`}
                            icon={style.icon}
                            actions={
                                <RecordActionButtons
                                    canWrite={canWrite}
                                    onEdit={() => handleEdit(diaper)}
                                    onDelete={() => setDeleteTargetId(diaper.id)}
                                    editLabel={`${style.label} ${formatDateTime(diaper.change_time)} を編集`}
                                    deleteLabel={`${style.label} ${formatDateTime(diaper.change_time)} を削除`}
                                />
                            }
                        >
                            <div className={`text-sm font-bold ${style.text}`}>
                                {style.label}
                                <span className="text-xs font-normal text-gray-500 dark:text-zinc-500 ml-2">
                                    {formatDateTime(diaper.change_time)}
                                </span>
                            </div>
                            {diaper.notes ? (
                                <div className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">{diaper.notes}</div>
                            ) : null}
                            <RecordMetaItems
                                displayName={diaper.recorded_by_display_name}
                                commentCount={diaper.comment_count}
                                onCommentClick={() => openComment(diaper)}
                                className="mt-0.5"
                            />
                        </RecordListItem>
                    )
                })}
            </HistoryCard>

            <ConfirmDeleteDialog />

            <DiaperEditDialog
                diaper={editingDiaper}
                open={editOpen}
                onOpenChange={setEditOpen}
                onSuccess={onDeleteSuccess} // Re-use refresh callback
            />

            {/* コメントダイアログ */}
            <CommentDialog />
        </>
    )
}
