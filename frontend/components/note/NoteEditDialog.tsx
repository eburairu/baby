"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Note, updateNote } from "@/hooks/useNotes"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { EditDialogBase } from "@/components/records/EditDialogBase"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { formatJapaneseDateTime, formatDateTimeLocal } from "@/lib/dateUtils"
import { useAsyncAction } from "@/hooks/useAsyncAction"

const noteSchema = z.object({
    note_time: z.string().min(1, "日時は必須です"),
    content: z.string().min(1, "内容は必須です").max(2000, "2000文字以内で入力してください"),
})

type NoteFormValues = z.infer<typeof noteSchema>

interface NoteEditDialogProps {
    note: Note | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

import { ErrorMessage } from "@/components/ui/error-message"
import { getErrorMessage, isApiError } from "@/lib/api"

export function NoteEditDialog({ note, open, onOpenChange, onSuccess }: NoteEditDialogProps) {
    const { loading: submitting, error, execute } = useAsyncAction()

    const form = useForm<NoteFormValues>({
        resolver: zodResolver(noteSchema),
        defaultValues: {
            note_time: "",
            content: "",
        },
    })

    useEffect(() => {
        if (note && open) {
            // openのタイミングで初期化してcascading rendersを回避するためにsetTimeoutを使用
            const timerId = setTimeout(() => {
                form.reset({
                    content: note.content,
                    note_time: formatDateTimeLocal(note.note_time),
                })
            }, 0)
            return () => clearTimeout(timerId)
        }
    }, [note, open, form])

    const handleUpdate = async (values: NoteFormValues) => {
        if (!note) return
        await execute(
            async () => {
                await updateNote(note.id, {
                    content: values.content,
                    note_time: new Date(values.note_time).toISOString(),
                    updated_at: note.updated_at
                })
            },
            {
                onSuccess: () => {
                    onSuccess()
                    onOpenChange(false)
                },
                errorMessage: (error: unknown) => {
                    if (isApiError(error) && error.status === 409) {
                        return "他のユーザーによってデータが更新されました。画面を更新して最新のデータを取得してください。"
                    }
                    return "更新に失敗しました。時間をおいて再度お試しください。"
                }
            }
        )
    }

    return (
        <EditDialogBase
            open={open}
            onOpenChange={onOpenChange}
            title="メモの編集"
        >
            {!!error && <ErrorMessage message={getErrorMessage(error, "更新に失敗しました。")} className="mb-2" />}
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

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            data-sentry-unmask
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                        >
                            キャンセル
                        </Button>
                        <Button
                            type="submit"
                            loading={submitting}
                            data-sentry-unmask className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            保存する
                        </Button>
                    </div>
                </form>
            </Form>
        </EditDialogBase>
    )
}
