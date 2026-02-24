"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useSleeps } from "@/hooks/useData"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Trash2, Moon, User, MessageCircle } from "lucide-react"
import { formatDuration } from "@/lib/ageUtils"
import { Sleep } from "@/types/sleep"
import { useUser } from "@/hooks/useAuth"
import { RecordCommentDialog } from "@/components/records/RecordCommentDialog"
import { useRecordDelete } from "@/hooks/useRecordDelete"
import { HistoryCard } from "@/components/records/HistoryCard"

interface Props {
    babyId: string
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

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingSleep) return
        try {
            await api.patch(`/sleeps/${editingSleep.id}`, {
                start_time: new Date(editingSleep.start_time).toISOString(),
                end_time: editingSleep.end_time ? new Date(editingSleep.end_time).toISOString() : null,
                notes: editingSleep.notes,
            })
            mutate()
            setIsEditOpen(false)
            setEditingSleep(null)
        } catch (e) {
            console.error(e)
        }
    }

    const isEmpty = !history || history.length === 0;

    return (
        <>
            <HistoryCard title="最近の睡眠" isEmpty={isEmpty} emptyMessage="記録はまだありません">
                {(history || []).map((sleep) => {
                    const duration = sleep.end_time
                        ? formatDuration(sleep.start_time, sleep.end_time)
                        : "睡眠中"

                    return (
                        <div key={sleep.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 bg-indigo-100 dark:bg-indigo-950/40 p-2 rounded-full text-indigo-500 dark:text-indigo-400">
                                    <Moon className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
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
                                </div>
                            </div>
                            {canWrite && (
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-indigo-600"
                                        onClick={() => {
                                            setEditingSleep(sleep)
                                            setIsEditOpen(true)
                                        }}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                                        onClick={() => setDeleteTargetId(sleep.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
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

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle data-sentry-unmask>睡眠記録の編集</DialogTitle>
                    </DialogHeader>
                    {editingSleep && (
                        <form onSubmit={handleEditSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium dark:text-zinc-300" data-sentry-unmask>開始日時</label>
                                    <div className="text-sm p-2 bg-gray-50 dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700 text-gray-600 dark:text-zinc-400">
                                        {format(new Date(editingSleep.start_time), "yyyy/MM/dd HH:mm", { locale: ja })}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium dark:text-zinc-300" data-sentry-unmask>終了日時</label>
                                    <div className="text-sm p-2 bg-gray-50 dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700 text-gray-600 dark:text-zinc-400">
                                        {editingSleep.end_time ? format(new Date(editingSleep.end_time), "yyyy/MM/dd HH:mm", { locale: ja }) : "現在"}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium dark:text-zinc-300" data-sentry-unmask>メモ</label>
                                <Textarea
                                    value={editingSleep.notes || ""}
                                    onChange={(e) => setEditingSleep({ ...editingSleep, notes: e.target.value })}
                                    className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                                />
                            </div>
                            <Button type="submit" data-sentry-unmask className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-none">保存</Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
