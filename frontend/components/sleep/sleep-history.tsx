"use client"

import { useState, useMemo } from "react"
import { useSleeps } from "@/hooks/useSleep"


import { RecordIcon } from "@/components/records/RecordIcon"
import { RecordMetaItems } from "@/components/records/RecordMetaItems"
import { formatDateTime, formatTime } from "@/lib/dateUtils"
import { api } from "@/lib/api"
import { HistoryCard } from "@/components/records/HistoryCard"
import { useRecordDelete } from "@/hooks/useRecordDelete"
import { Sleep } from "@/types/sleep"
import { formatDuration } from "@/lib/ageUtils"
import { RecordListItem } from "@/components/records/RecordListItem"
import { RecordActionButtons } from "@/components/records/RecordActionButtons"
import { SleepEditDialog } from "./SleepEditDialog"
import { useRecordComments } from "@/hooks/useRecordComments"

interface Props {
    babyId: number | string
    canWrite?: boolean
    initialCommentRecordId?: number | null
}

export function SleepHistory({ babyId, canWrite = true, initialCommentRecordId }: Props) {
    const { sleeps, mutate } = useSleeps(babyId)
    const [editingSleep, setEditingSleep] = useState<Sleep | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    const { setDeleteTargetId, ConfirmDeleteDialog } = useRecordDelete({
        onDelete: async (id) => {
            await api.delete(`/sleeps/${id}`)
        },
        onSuccess: mutate,
        resourceName: "睡眠記録"
    });

    const history = useMemo(() => {
        return sleeps?.filter((s) => s.end_time).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    }, [sleeps])

    const { openComment, CommentDialog } = useRecordComments({
        records: history,
        recordType: "sleep",
        initialCommentRecordId,
        getTitle: (s) => `睡眠 ${formatDateTime(s.start_time)}`,
        onCommentChange: () => mutate()
    });

    const isEmpty = !history || history.length === 0;

    return (
        <>
            <HistoryCard title="最近の睡眠" isEmpty={isEmpty} emptyMessage="記録はまだありません">
                {(history || []).map((sleep) => {
                    const duration = sleep.end_time
                        ? formatDuration(sleep.start_time, sleep.end_time)
                        : "睡眠中"

                    return (
                        <RecordListItem
                            key={sleep.id}
                            icon={<RecordIcon type="sleep" />}

                            actions={
                                <RecordActionButtons
                                    canWrite={canWrite}
                                    onEdit={() => {
                                        setEditingSleep(sleep)
                                        setIsEditOpen(true)
                                    }}
                                    onDelete={() => setDeleteTargetId(sleep.id)}
                                />
                            }
                        >
                            <div className="flex items-center gap-2">
                                <p className="font-medium text-sm text-gray-900 dark:text-zinc-100">
                                    {formatDateTime(sleep.start_time)}
                                    <span className="text-gray-400 dark:text-zinc-500 mx-2">-</span>
                                    {sleep.end_time ? formatTime(sleep.end_time) : "現在"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 flex-wrap">
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded text-slate-600 dark:text-zinc-400 font-medium">
                                    {duration}
                                </span>
                                <RecordMetaItems
                                    displayName={sleep.recorded_by_display_name}
                                    commentCount={sleep.comment_count}
                                    onCommentClick={() => openComment(sleep)}
                                    className="mt-0"
                                />
                            </div>
                            {sleep.notes && (
                                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 line-clamp-1">
                                    {sleep.notes}
                                </p>
                            )}
                        </RecordListItem>
                    )
                })}
            </HistoryCard>

            <ConfirmDeleteDialog />

            <CommentDialog />

            <SleepEditDialog
                sleep={editingSleep}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                onSuccess={mutate}
            />
        </>
    )
}
