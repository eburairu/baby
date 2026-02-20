"use client"
import { useState, useEffect, useRef } from "react"
import { Diaper, DiaperType } from "@/types/diaper"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil, User, MessageCircle } from "lucide-react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DiaperEditDialog } from "./DiaperEditDialog"
import { useUser } from "@/hooks/useAuth"
import { RecordCommentDialog } from "@/components/records/RecordCommentDialog"
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

// Minimal date formatter if date-fns is missing, or use Intl.DateTimeFormat
const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('ja-JP', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

interface Props {
    diapers: Diaper[]
    onDeleteSuccess: () => void
    canWrite?: boolean
    initialCommentRecordId?: number | null
}

export function DiaperHistory({ diapers, onDeleteSuccess, canWrite = true, initialCommentRecordId }: Props) {
    const { user } = useUser()
    const [editingDiaper, setEditingDiaper] = useState<Diaper | null>(null)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [commentTarget, setCommentTarget] = useState<{ id: number; title: string } | null>(null)
    const initializedRef = useRef(false)

    useEffect(() => {
        if (initialCommentRecordId && diapers.length > 0 && !initializedRef.current) {
            const target = diapers.find(d => d.id === initialCommentRecordId)
            if (target) {
                initializedRef.current = true
                const style = getStyles(target.diaper_type)
                setCommentTarget({ id: target.id, title: `${style.label} ${formatDate(target.change_time)}` })
            }
        }
    }, [initialCommentRecordId, diapers])

    const handleDelete = async () => {
        if (deleteTargetId === null) return
        setIsDeleting(true)
        try {
            await api.delete(`/diapers/${deleteTargetId}`)
            onDeleteSuccess()
        } catch (e) {
            console.error(e)
            alert("削除に失敗しました")
        } finally {
            setIsDeleting(false)
            setDeleteTargetId(null)
        }
    }

    const handleEdit = (diaper: Diaper) => {
        setEditingDiaper(diaper)
        setEditOpen(true)
    }

    const getStyles = (type: DiaperType) => {
        switch (type) {
            case DiaperType.WET:
                return {
                    bg: "bg-blue-50 dark:bg-blue-950/30",
                    border: "border-blue-100 dark:border-blue-900/50",
                    text: "text-blue-700 dark:text-blue-400",
                    icon: "💧",
                    label: "おしっこ"
                }
            case DiaperType.DIRTY:
                return {
                    bg: "bg-amber-50 dark:bg-amber-950/30",
                    border: "border-amber-100 dark:border-amber-900/50",
                    text: "text-amber-700 dark:text-amber-400",
                    icon: "💩",
                    label: "うんち"
                }
            case DiaperType.BOTH:
                return {
                    bg: "bg-purple-50 dark:bg-purple-950/30",
                    border: "border-purple-100 dark:border-purple-900/50",
                    text: "text-purple-700 dark:text-purple-400",
                    icon: "💧💩",
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

    return (
        <>
            <Card className="rounded-2xl shadow-sm border-0 transition-colors">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-zinc-500">最近の記録</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {diapers.length === 0 ? <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-4">記録がありません</p> : null}

                    {diapers.map((diaper) => {
                        const style = getStyles(diaper.diaper_type)
                        return (
                            <div
                                key={diaper.id}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${style.bg} ${style.border}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{style.icon}</span>
                                    <div>
                                        <div className={`text-sm font-bold ${style.text}`}>
                                            {style.label}
                                            <span className="text-xs font-normal text-gray-500 dark:text-zinc-500 ml-2">
                                                {formatDate(diaper.change_time)}
                                            </span>
                                        </div>
                                        {diaper.notes ? (
                                            <div className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">{diaper.notes}</div>
                                        ) : null}
                                        {diaper.recorded_by_display_name ? (
                                            <div className="inline-flex items-center gap-0.5 text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                                                <User className="w-3 h-3" />
                                                {diaper.recorded_by_display_name}
                                            </div>
                                        ) : null}
                                        <button
                                            onClick={() => setCommentTarget({ id: diaper.id, title: `${style.label} ${formatDate(diaper.change_time)}` })}
                                            className="inline-flex items-center gap-0.5 text-xs text-gray-400 dark:text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors mt-0.5"
                                        >
                                            <MessageCircle className="w-3 h-3" />
                                            {(diaper.comment_count ?? 0) > 0 && <span>{diaper.comment_count}</span>}
                                        </button>
                                    </div>
                                </div>
                                {canWrite ? (
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 dark:text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-transparent"
                                            onClick={() => handleEdit(diaper)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-transparent"
                                            onClick={() => setDeleteTargetId(diaper.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : null}
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {/* 削除確認ダイアログ */}
            <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => { if (!open) setDeleteTargetId(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>記録の削除</AlertDialogTitle>
                        <AlertDialogDescription>
                            このおむつ記録を削除しますか？この操作は取り消せません。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                            削除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DiaperEditDialog
                diaper={editingDiaper}
                open={editOpen}
                onOpenChange={setEditOpen}
                onSuccess={onDeleteSuccess} // Re-use refresh callback
            />

            {/* コメントダイアログ */}
            {commentTarget && (
                <RecordCommentDialog
                    open={commentTarget !== null}
                    onOpenChange={(open) => { if (!open) setCommentTarget(null) }}
                    recordType="diaper"
                    recordId={commentTarget.id}
                    title={commentTarget.title}
                    currentUserId={user?.id}
                    onCommentChange={onDeleteSuccess}
                />
            )}
        </>
    )
}
