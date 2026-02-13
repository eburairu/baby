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
import type { ContractionRecord } from "@/types/contraction"

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
}

export default function ContractionHistory({ contractions, onDeleted }: ContractionHistoryProps) {
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

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
                                    <div className="flex gap-4 text-sm text-muted-foreground">
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
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                                    onClick={() => setDeleteTargetId(record.id)}
                                    aria-label="削除"
                                >
                                    ✕
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

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
