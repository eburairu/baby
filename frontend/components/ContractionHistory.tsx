"use client"

import { formatTimeHHMM, formatSecondsToJapanese } from "@/lib/ageUtils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ContractionRecord } from "@/types/contraction"
import { Pencil, Trash2, User, MessageCircle } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { useContractionActions } from "@/hooks/useContractionActions"
import { useRecordDelete } from "@/hooks/useRecordDelete"
import { useRecordComments } from "@/hooks/useRecordComments"
import { api } from "@/lib/api"


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

    const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        await executeUpdate(new FormData(e.currentTarget))
    }

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
                            <div key={record.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium w-14">
                                        {formatTimeHHMM(record.start_time)}
                                    </span>
                                    <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-muted-foreground">
                                        {record.duration_seconds != null && (
                                            <span>
                                                持続: <span className="font-medium text-foreground">{formatSecondsToJapanese(record.duration_seconds)}</span>
                                            </span>
                                        )}
                                        {record.interval_seconds != null && (
                                            <span>
                                                間隔: <span className="font-medium text-foreground">{formatSecondsToJapanese(record.interval_seconds)}</span>
                                            </span>
                                        )}
                                        {record.recorded_by_display_name && (
                                            <span className="inline-flex items-center gap-0.5 text-xs">
                                                <User className="w-3 h-3" />
                                                {record.recorded_by_display_name}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => openComment(record)}
                                            className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-indigo-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm p-0.5"
                                            aria-label={(record.comment_count ?? 0) > 0 ? `${record.comment_count}件のコメントを表示` : "コメントを追加"}
                                        >
                                            <MessageCircle className="w-3 h-3" aria-hidden="true" />
                                            {(record.comment_count ?? 0) > 0 && <span>{record.comment_count}</span>}
                                        </button>
                                    </div>
                                </div>
                                {canWrite && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-primary h-8 w-8 p-0"
                                            onClick={() => openEditDialog(record)}
                                            aria-label="編集"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                                            onClick={() => setDeleteTargetId(record.id)}
                                            aria-label="削除"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <ConfirmDeleteDialog />
            <CommentDialog />

            {/* 編集ダイアログ */}
            <Dialog open={editTarget !== null} onOpenChange={(open) => { if (!open) closeEditDialog() }}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleUpdateSubmit}>
                        <DialogHeader>
                            <DialogTitle>記録の編集</DialogTitle>
                            <DialogDescription>
                                陣痛の開始時刻や持続時間を修正します。
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="start_time" className="text-right">開始時刻</Label>
                                <Input
                                    id="start_time"
                                    name="start_time"
                                    type="time"
                                    defaultValue={editTarget ? new Date(editTarget.start_time).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", hour12: false }) : ""}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="duration_seconds" className="text-right">持続(秒)</Label>
                                <Input
                                    id="duration_seconds"
                                    name="duration_seconds"
                                    type="number"
                                    defaultValue={editTarget?.duration_seconds ?? 0}
                                    className="col-span-3"
                                    required
                                    min="0"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="notes" className="text-right">メモ</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    defaultValue={editTarget?.notes ?? ""}
                                    className="col-span-3"
                                    placeholder="痛みの強さなど"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeEditDialog}>キャンセル</Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? "保存中..." : "保存する"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
