"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { noteSchema, NoteFormValues } from "@/schemas/note"
import { formatDateTimeLocal } from "@/lib/dateUtils"
import { Plus, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { createNote } from "@/hooks/useNotes"
import { cn } from "@/lib/utils"
import { ErrorMessage } from "@/components/ui/error-message"
import { UI_BUTTONS } from "@/constants/ui-colors"
import { useAsyncAction } from "@/hooks/useAsyncAction"

interface Props {
    babyId: number
    onAddSuccess: (recordId?: number) => void
    defaultExpanded?: boolean
}

import { getErrorMessage } from "@/lib/api"

export function NoteForm({ babyId, onAddSuccess, defaultExpanded = false }: Props) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)
    const { loading: submitting, error, execute } = useAsyncAction()

    const form = useForm<NoteFormValues>({
        resolver: zodResolver(noteSchema),
        defaultValues: {
            note_time: formatDateTimeLocal(new Date()),
            content: "",
        },
    })

    const onSubmit = async (values: NoteFormValues) => {
        await execute(
            async () => {
                const newNote = await createNote(babyId, {
                    content: values.content,
                    note_time: new Date(values.note_time).toISOString()
                })
                return newNote
            },
            {
                onSuccess: (newNote) => {
                    form.reset({
                        note_time: formatDateTimeLocal(new Date()),
                        content: "",
                    })
                    setIsExpanded(false)
                    onAddSuccess(newNote?.id)
                },
                errorMessage: "メモの保存に失敗しました。時間をおいて再度お試しください。"
            }
        )
    }

    if (!isExpanded) {
        return (
            <Button 
                onClick={() => setIsExpanded(true)}
                className={cn("w-full rounded-xl py-6 shadow-sm flex gap-2 transition-all duration-200", UI_BUTTONS.primary)}
                aria-label="新しいメモを入力する" data-sentry-unmask
            >
                <Plus className="h-5 w-5" />
                メモを追加する
            </Button>
        )
    }

    return (
        <Card className="rounded-2xl border-0 shadow-sm overflow-hidden dark:bg-zinc-900 transition-all duration-300">
            <CardContent className="p-4">
                {!!error && <ErrorMessage message={getErrorMessage(error, "メモの保存に失敗しました。")} className="mb-4" />}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="note_time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-gray-500 dark:text-zinc-400" data-sentry-unmask required>日時</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="datetime-local" 
                                            {...field} 
                                            className="dark:bg-zinc-800 dark:border-zinc-700 h-9"
                                        />
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
                                    <FormLabel className="text-xs text-gray-500 dark:text-zinc-400" data-sentry-unmask required>内容</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="今日の出来事や赤ちゃんの様子など..." 
                                            rows={4}
                                            {...field} 
                                            className="dark:bg-zinc-800 dark:border-zinc-700 resize-none leading-relaxed"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-2 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsExpanded(false)
                                }}
                                data-sentry-unmask className="flex-1 dark:text-zinc-400"
                                disabled={submitting}
                            >
                                キャンセル
                            </Button>
                            <Button
                                type="submit"
                                loading={submitting}
                                data-sentry-unmask className={cn("flex-1 shadow-md shadow-indigo-500/20", UI_BUTTONS.primary)}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                保存する
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
