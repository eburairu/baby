"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { api } from "@/lib/api"
import { useSleeps } from "@/hooks/useData"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { SleepCreate } from "@/types/sleep"
import { UI_BUTTONS } from "@/constants/ui-colors"
import { sleepSchema, SleepFormValues } from "@/schemas/sleep"
import { useBaseRecordForm } from "@/hooks/useBaseRecordForm"

interface Props {
    babyId: string
}

export function SleepForm({ babyId }: Props) {
    const { mutate } = useSleeps(babyId)
    const [isOpen, setIsOpen] = useState(false)

    const form = useForm<SleepFormValues>({
        resolver: zodResolver(sleepSchema),
        defaultValues: {
            start_time: "",
            end_time: "",
            notes: "",
        },
    })

    const { submitRecord, isSubmitting } = useBaseRecordForm<SleepFormValues>({
        endpoint: "/sleeps/",
        babyId,
        onSuccess: () => {
            mutate()
            form.reset()
            setIsOpen(false)
        },
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
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-zinc-800 hover:bg-indigo-50 dark:hover:bg-zinc-800 hover:text-indigo-700 dark:hover:text-indigo-300 h-12 rounded-xl shadow-sm transition-colors" data-sentry-unmask>
                    <Plus className="mr-2 h-4 w-4" />
                    手動で記録を追加
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>睡眠記録の手動追加</DialogTitle>
                </DialogHeader>
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
                        <Button type="submit" className={cn("w-full shadow-none", UI_BUTTONS.primary)} loading={form.formState.isSubmitting} data-sentry-unmask>
                            {form.formState.isSubmitting ? "保存中..." : "記録する"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
