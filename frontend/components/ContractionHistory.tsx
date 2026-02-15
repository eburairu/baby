"use client"

import { useState, useCallback } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Pencil, Trash2 } from "lucide-react"

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    if (m > 0) return `${m}分${s}秒`
    return `${s}秒`
}

function formatTime(isoString: string): string {
    const d = new Date(isoString)
    return d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
}

interface ContractionHistoryProps {
    contractions: ContractionRecord[]
    onDeleted: () => void
    onUpdated?: () => void
    canWrite?: boolean
}

export default function ContractionHistory({ contractions, onDeleted, onUpdated, canWrite = true }: ContractionHistoryProps) {
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
    const [editTarget, setEditTarget] = useState<ContractionRecord | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)

    const handleDelete = useCallback(async () => {
        if (deleteTargetId === null) return
        try {
            await api.delete(`/contractions/${deleteTargetId}`)
            onDeleted()
        } catch (err) {
            console.error("Failed to delete contraction", err)
        } finally {
            setDeleteTargetId(null)
        }
    }, [deleteTargetId, onDeleted])

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editTarget) return

        setIsUpdating(true)
        try {
            const formData = new FormData(e.currentTarget)
            const startTimeStr = formData.get("start_time") as string
            const durationStr = formData.get("duration_seconds") as string
            const notes = formData.get("notes") as string

            // 日付部分は維持しつつ時刻だけ更新
            const originalStart = new Date(editTarget.start_time)
            const [hours, minutes] = startTimeStr.split(":").map(Number)
            const newStart = new Date(originalStart)
            newStart.setHours(hours, minutes, 0, 0)

            const durationSeconds = parseInt(durationStr, 10)
            const newEnd = new Date(newStart.getTime() + durationSeconds * 1000)

            await api.patch(`/contractions/${editTarget.id}`, {
                start_time: newStart.toISOString(),
                end_time: newEnd.toISOString(),
                duration_seconds: durationSeconds,
                notes: notes,
            })
            setEditTarget(null)
            onUpdated?.()
        } catch (err) {
            console.error("Failed to update contraction", err)
        } finally {
            setIsUpdating(false)
        }
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
                                        {formatTime(record.start_time)}
                                    </span>
                                    <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-muted-foreground">
                                        {record.duration_seconds != null && (
                                            <span>
                                                持続: <span className="font-medium text-foreground">{formatDuration(record.duration_seconds)}</span>
                                            </span>
                                        )}
                                        {record.interval_seconds != null && (
                                            <span>
                                                間隔: <span className="font-medium text-foreground">{formatDuration(record.interval_seconds)}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {canWrite && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-primary h-8 w-8 p-0"
                                            onClick={() => setEditTarget(record)}
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

            {/* 編集ダイアログ */}
            <Dialog open={editTarget !== null} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleUpdate}>
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
                            <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>キャンセル</Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? "保存中..." : "保存する"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 削除確認ダイアログ */}
            <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => { if (!open) setDeleteTargetId(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>記録の削除</AlertDialogTitle>
                        <AlertDialogDescription>
                            この陣痛記録を削除しますか？この操作は取り消せません。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            削除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
