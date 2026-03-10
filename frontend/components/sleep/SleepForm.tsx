"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { Sleep, SleepCreate, SleepUpdate } from "@/types/sleep"
import { UI_BUTTONS } from "@/constants/ui-colors"
import { sleepSchema, SleepFormValues } from "@/schemas/sleep"
import { useBaseRecordForm } from "@/hooks/useBaseRecordForm"
import { formatDateTimeLocal } from "@/lib/dateUtils"
import { api } from "@/lib/api"

interface SleepFormProps {
    babyId: string | number
    initialData?: Sleep | null
    onSuccess: (record?: unknown) => void
}

export function SleepForm({ babyId, initialData, onSuccess }: SleepFormProps) {
    const isEditing = !!initialData

    const form = useForm<SleepFormValues>({
        resolver: zodResolver(sleepSchema),
        defaultValues: {
            start_time: initialData
                ? formatDateTimeLocal(initialData.start_time)
                : "",
            end_time: initialData?.end_time
                ? formatDateTimeLocal(initialData.end_time)
                : "",
            notes: initialData?.notes ?? "",
        },
    })

    const { submitRecord, isSubmitting } = useBaseRecordForm<SleepFormValues>({
        endpoint: "/sleeps/",
        babyId,
        onSuccess: (data) => {
            if (!isEditing) {
                form.reset()
            }
            onSuccess(data)
        },
        successMessage: isEditing ? "更新しました" : "記録しました"
    })

    const onSubmit = async (values: SleepFormValues) => {
        await submitRecord(values, (vals, base) => {
            const payload: SleepCreate = {
                baby_id: Number(base.baby_id),
                start_time: new Date(vals.start_time).toISOString(),
                notes: vals.notes,
            }
            if (vals.end_time) {
                payload.end_time = new Date(vals.end_time).toISOString()
            }
            return payload
        },
        initialData ? async (payload) => {
            // payload is TPayload (inferred as SleepCreate).
            // SleepCreate has start_time, notes, end_time (optional), baby_id.
            // SleepUpdate has start_time (optional), notes (optional), end_time (optional).
            // We can safely cast payload to SleepUpdate for the API call, ignoring baby_id.
            const updatePayload = payload as unknown as SleepUpdate;
            return await api.patch<Sleep>(`/sleeps/${initialData.id}`, updatePayload)
        } : undefined)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="start_time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="dark:text-zinc-300">開始日時</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="end_time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="dark:text-zinc-300">終了日時 (任意)</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="dark:text-zinc-300">メモ</FormLabel>
                            <FormControl>
                                <Textarea placeholder="例: 抱っこで寝落ち" {...field} className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className={cn("w-full shadow-none", UI_BUTTONS.primary)} loading={isSubmitting} data-sentry-unmask>
                    {isEditing ? "保存する" : "記録する"}
                </Button>
            </form>
        </Form>
    )
}
