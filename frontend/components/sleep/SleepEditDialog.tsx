"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Sleep } from "@/types/sleep"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface SleepEditDialogProps {
    sleep: Sleep | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function SleepEditDialog({ sleep, open, onOpenChange, onSuccess }: SleepEditDialogProps) {
    const [notes, setNotes] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Reset form when sleep changes
    useEffect(() => {
        if (sleep) {
            setNotes(sleep.notes || "")
        }
    }, [sleep])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!sleep) return

        setIsSubmitting(true)
        try {
            await api.patch(`/sleeps/${sleep.id}`, {
                start_time: new Date(sleep.start_time).toISOString(),
                end_time: sleep.end_time ? new Date(sleep.end_time).toISOString() : null,
                notes: notes,
            })
            onSuccess()
            onOpenChange(false)
        } catch (e) {
            console.error(e)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!sleep) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle data-sentry-unmask>睡眠記録の編集</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium dark:text-zinc-300" data-sentry-unmask>開始日時</label>
                            <div className="text-sm p-2 bg-gray-50 dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700 text-gray-600 dark:text-zinc-400">
                                {format(new Date(sleep.start_time), "yyyy/MM/dd HH:mm", { locale: ja })}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium dark:text-zinc-300" data-sentry-unmask>終了日時</label>
                            <div className="text-sm p-2 bg-gray-50 dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700 text-gray-600 dark:text-zinc-400">
                                {sleep.end_time ? format(new Date(sleep.end_time), "yyyy/MM/dd HH:mm", { locale: ja }) : "現在"}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium dark:text-zinc-300" data-sentry-unmask>メモ</label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                        />
                    </div>
                    <Button
                        type="submit"
                        data-sentry-unmask
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-none"
                        loading={isSubmitting}
                    >
                        保存
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
