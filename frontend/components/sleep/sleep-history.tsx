"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useSleeps } from "@/hooks/useData"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Moon, User, MessageCircle } from "lucide-react"
import { api } from "@/lib/api"
import { useUser } from "@/hooks/useAuth"
import { RecordCommentDialog } from "@/components/records/RecordCommentDialog"
import { HistoryCard } from "@/components/records/HistoryCard"
import { useRecordDelete } from "@/hooks/useRecordDelete"
import { Sleep } from "@/types/sleep"
import { formatDuration } from "@/lib/ageUtils"
import { RecordListItem } from "@/components/records/RecordListItem"
import { RecordActionButtons } from "@/components/records/RecordActionButtons"
import { SleepEditDialog } from "./SleepEditDialog"

interface Props {
    babyId: number | string
    canWrite?: boolean
    initialCommentRecordId?: number | null
}

export function SleepHistory({ babyId, canWrite = true, initialCommentRecordId }: Props) {
    const { user } = useUser()
    const { sleeps, mutate } = useSleeps(babyId)
    const [editingSleep, setEditingSleep] = useState<Sleep | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [commentTarget, setCommentTarget] = useState<{ id: number; title: string } | null>(null)
    const initializedRef = useRef(false)

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

    useEffect(() => {
        if (initialCommentRecordId && history && history.length > 0 && !initializedRef.current) {
            const target = history.find(s => s.id === initialCommentRecordId)
            if (target) {
                initializedRef.current = true
                setTimeout(() => {
                    setCommentTarget({ id: target.id, title: `睡眠 ${format(new Date(target.start_time), "M/d HH:mm", { locale: ja })}` })
                }, 0)
            }
        }
    }, [initialCommentRecordId, history])

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
                            icon={
                                <div className="bg-indigo-100 dark:bg-indigo-950/40 p-2 rounded-full text-indigo-500 dark:text-indigo-400">
                                    <Moon className="w-5 h-5" />
                                </div>
                            }
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
                                    {format(new Date(sleep.start_time), "M/d HH:mm", { locale: ja })}
                                    <span className="text-gray-400 dark:text-zinc-500 mx-2">-</span>
                                    {sleep.end_time ? format(new Date(sleep.end_time), "HH:mm", { locale: ja }) : "現在"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 flex-wrap">
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded text-slate-600 dark:text-zinc-400 font-medium">
                                    {duration}
                                </span>
                                {sleep.recorded_by_display_name && (
                                    <span className="inline-flex items-center gap-0.5 text-gray-400 dark:text-zinc-500">
                                        <User className="w-3 h-3" />
                                        {sleep.recorded_by_display_name}
                                    </span>
                                )}
                                <button
                                    onClick={() => setCommentTarget({ id: sleep.id, title: `睡眠 ${format(new Date(sleep.start_time), "M/d HH:mm", { locale: ja })}` })}
                                    className="inline-flex items-center gap-0.5 text-gray-400 dark:text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                                >
                                    <MessageCircle className="w-3 h-3" />
                                    {(sleep.comment_count ?? 0) > 0 && <span>{sleep.comment_count}</span>}
                                </button>
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

            {commentTarget && (
                <RecordCommentDialog
                    open={commentTarget !== null}
                    onOpenChange={(open) => { if (!open) setCommentTarget(null) }}
                    recordType="sleep"
                    recordId={commentTarget.id}
                    title={commentTarget.title}
                    currentUserId={user?.id}
                    onCommentChange={() => mutate()}
                />
            )}

            <SleepEditDialog
                sleep={editingSleep}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                onSuccess={mutate}
            />
        </>
    )
}
