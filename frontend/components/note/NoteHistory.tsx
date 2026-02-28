"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Note, deleteNote, updateNote } from "@/hooks/useNotes"
import { Button } from "@/components/ui/button"
import { RecordMetaItems } from "@/components/records/RecordMetaItems"
import { RecordActionButtons } from "@/components/records/RecordActionButtons"
import { formatFullDateTime, formatJapaneseDateTime } from "@/lib/dateUtils"
import { Calendar, Save, Loader2 } from "lucide-react"


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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { ErrorMessage } from "@/components/ui/error-message"
import { useUser } from "@/hooks/useAuth"
import { RecordCommentDialog } from "@/components/records/RecordCommentDialog"

const noteSchema = z.object({
    note_time: z.string().min(1, "日時は必須です"),
    content: z.string().min(1, "内容は必須です").max(2000, "2000文字以内で入力してください"),
})

type NoteFormValues = z.infer<typeof noteSchema>

interface Props {
    notes: Note[]
    onRefresh: () => void
    canWrite?: boolean
    initialCommentRecordId?: number | null
}

export function NoteHistory({ notes, onRefresh, canWrite = true, initialCommentRecordId }: Props) {
    const { user } = useUser()
    const [editingNote, setEditingNote] = useState<Note | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [commentTarget, setCommentTarget] = useState<{ id: number; title: string } | null>(null)
    const initializedRef = useRef(false)

    useEffect(() => {
        if (initialCommentRecordId && notes.length > 0 && !initializedRef.current) {
            const target = notes.find(n => n.id === initialCommentRecordId)
            if (target) {
                initializedRef.current = true
                setCommentTarget({ id: target.id, title: `メモ ${formatFullDateTime(target.note_time)}` })
            }
        }
    }, [initialCommentRecordId, notes])

    const form = useForm<NoteFormValues>({
        resolver: zodResolver(noteSchema),
        defaultValues: {
            note_time: "",
            content: "",
        },
    })

    const handleEditStart = (note: Note) => {
        setEditingNote(note)
        
        const date = new Date(note.note_time)
        const localIso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
        
        form.reset({
            content: note.content,
            note_time: localIso,
        })
        
        setError(null)
        setIsEditing(true)
    }

    const handleUpdate = async (values: NoteFormValues) => {
        if (!editingNote) return
        setSubmitting(true)
        setError(null)
        try {
            await updateNote(editingNote.id, {
                content: values.content,
                note_time: new Date(values.note_time).toISOString()
            })
            onRefresh()
            setIsEditing(false)
        } catch (e) {
            console.error(e)
            setError("更新に失敗しました。時間をおいて再度お試しください。")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (deleteTargetId === null) return
        setIsDeleting(true)
        try {
            await deleteNote(deleteTargetId)
            onRefresh()
        } catch (e) {
            console.error(e)
            alert("削除に失敗しました")
        } finally {
            setIsDeleting(false)
            setDeleteTargetId(null)
        }
    }

    return (
        <>
            <Card className="rounded-2xl shadow-sm border-0 transition-colors">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-zinc-500">履歴</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {notes.length === 0 && (
                        <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-8">
                            メモがまだありません
                        </p>
                    )}

                    {notes.map((note) => (
                        <div
                            key={note.id}
                            className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {formatFullDateTime(note.note_time)}
                                    </span>
                                    <RecordMetaItems
                                        displayName={note.recorded_by_display_name}
                                        commentCount={note.comment_count}
                                        onCommentClick={() => setCommentTarget({ id: note.id, title: `メモ ${formatFullDateTime(note.note_time)}` })}
                                        className="contents"
                                    />
                                </div>
                                {canWrite && (
                                    <RecordActionButtons
                                        canWrite={canWrite}
                                        onEdit={() => handleEditStart(note)}
                                        onDelete={() => setDeleteTargetId(note.id)}
                                        editLabel="メモを編集"
                                        deleteLabel="メモを削除"
                                    />
                                )}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                                {note.content}
                            </p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* コメントダイアログ */}
            {commentTarget && (
                <RecordCommentDialog
                    open={commentTarget !== null}
                    onOpenChange={(open) => { if (!open) setCommentTarget(null) }}
                    recordType="note"
                    recordId={commentTarget.id}
                    title={commentTarget.title}
                    currentUserId={user?.id}
                    onCommentChange={onRefresh}
                />
            )}

            {/* 編集ダイアログ */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="sm:max-w-md dark:bg-zinc-900 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle data-sentry-unmask>メモの編集</DialogTitle>
                    </DialogHeader>
                    
                    {error && <ErrorMessage message={error} className="mb-2" />}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4 py-2">
                            <FormField
                                control={form.control}
                                name="note_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel data-sentry-unmask>日時</FormLabel>
                                        <FormControl>
                                            <div className="text-sm p-2 bg-gray-50 dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700 text-gray-600 dark:text-zinc-400">
                                                {field.value ? formatJapaneseDateTime(field.value) : "-"}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel data-sentry-unmask>内容</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={5}
                                                {...field}
                                                className="dark:bg-zinc-800 dark:border-zinc-700 resize-none leading-relaxed"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <DialogFooter className="gap-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    data-sentry-unmask onClick={() => setIsEditing(false)}
                                    disabled={submitting}
                                >
                                    キャンセル
                                </Button>
                                <Button 
                                    type="submit" 
                                    loading={submitting}
                                    data-sentry-unmask className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {!submitting && <Save className="h-4 w-4 mr-2" />}
                                    {submitting ? "保存中..." : "保存する"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* 削除確認 */}
            <AlertDialog open={deleteTargetId !== null} onOpenChange={(o) => !o && setDeleteTargetId(null)}>
                <AlertDialogContent className="dark:bg-zinc-900 dark:border-zinc-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle data-sentry-unmask>メモの削除</AlertDialogTitle>
                        <AlertDialogDescription data-sentry-unmask>
                            このメモを削除しますか？この操作は取り消せません。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting} data-sentry-unmask>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} data-sentry-unmask className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            削除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
