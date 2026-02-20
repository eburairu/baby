"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
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
import { ErrorMessage } from "@/components/ui/error-message"

const noteSchema = z.object({
    note_time: z.string().min(1, "日時は必須です"),
    content: z.string().min(1, "内容は必須です").max(2000, "2000文字以内で入力してください"),
})

type NoteFormValues = z.infer<typeof noteSchema>

interface Props {
    babyId: number
    onAddSuccess: (recordId?: number) => void
}

export function NoteForm({ babyId, onAddSuccess }: Props) {
    const [submitting, setSubmitting] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<NoteFormValues>({
        resolver: zodResolver(noteSchema),
        defaultValues: {
            note_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            content: "",
        },
    })

    const onSubmit = async (values: NoteFormValues) => {
        setSubmitting(true)
        setError(null)
        try {
            const newNote = await createNote(babyId, {
                content: values.content,
                note_time: new Date(values.note_time).toISOString()
            })
            form.reset({
                note_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                content: "",
            })
            setIsExpanded(false)
            onAddSuccess(newNote?.id)
        } catch (err) {
            console.error(err)
            setError("メモの保存に失敗しました。時間をおいて再度お試しください。")
        } finally {
            setSubmitting(false)
        }
    }

    if (!isExpanded) {
        return (
            <Button 
                onClick={() => setIsExpanded(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 shadow-sm flex gap-2 transition-all duration-200"
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
                {error && <ErrorMessage message={error} className="mb-4" />}
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="note_time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-gray-500 dark:text-zinc-400" data-sentry-unmask>日時</FormLabel>
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
                                    <FormLabel className="text-xs text-gray-500 dark:text-zinc-400" data-sentry-unmask>内容</FormLabel>
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
                                    setError(null)
                                }}
                                data-sentry-unmask className="flex-1 dark:text-zinc-400"
                                disabled={submitting}
                            >
                                キャンセル
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                data-sentry-unmask className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {submitting ? "保存中..." : "保存する"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
