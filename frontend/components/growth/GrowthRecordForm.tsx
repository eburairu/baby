"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { Growth } from "@/types/growth"

const growthSchema = z.object({
    date: z.string().min(1, "日付を選択してください"),
    height: z.string().optional(),
    weight: z.string().optional(),
    head_circumference: z.string().optional(),
    notes: z.string().optional(),
}).refine(data => data.height || data.weight || data.head_circumference, {
    message: "身長、体重、頭囲の少なくとも1つを入力してください",
    path: ["height"],
})

type GrowthFormValues = z.infer<typeof growthSchema>

interface GrowthRecordFormProps {
    babyId: number
    record?: Growth | null
    isOpen: boolean
    onClose: () => void
    onSuccess: (recordId?: number) => void
}

export function GrowthRecordForm({
    babyId,
    record,
    isOpen,
    onClose,
    onSuccess,
}: GrowthRecordFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const defaultValues: GrowthFormValues = useMemo(() => {
        if (record) {
            return {
                date: record.date,
                height: record.height?.toString() || "",
                weight: record.weight?.toString() || "",
                head_circumference: record.head_circumference?.toString() || "",
                notes: record.notes || "",
            }
        }
        return {
            date: format(new Date(), "yyyy-MM-dd"),
            height: "",
            weight: "",
            head_circumference: "",
            notes: "",
        }
    }, [record, isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

    const form = useForm<GrowthFormValues>({
        resolver: zodResolver(growthSchema),
        defaultValues,
        values: defaultValues, // Sync form with record prop changes
    })

    const onSubmit = async (values: GrowthFormValues) => {
        setIsSubmitting(true)
        try {
            const payload = {
                baby_id: babyId,
                date: values.date,
                height: values.height ? parseFloat(values.height) : null,
                weight: values.weight ? parseInt(values.weight) : null,
                head_circumference: values.head_circumference ? parseFloat(values.head_circumference) : null,
                notes: values.notes || null,
            }

            if (record) {
                await api.put(`/growths/${record.id}`, payload)
                onSuccess()
            } else {
                const newRecord = await api.post<{ id: number }>("/growths/", payload)
                onSuccess(newRecord?.id)
            }
            toast.success("記録しました")
            onClose()
        } catch (error) {
            console.error("Failed to save growth record:", error)
            toast.error("保存に失敗しました")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{record ? "記録を編集" : "新しい記録を追加"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>計測日</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            max="9999-12-31"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="height"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>身長 (cm)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                placeholder="0.0"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>体重 (g)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="head_circumference"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>頭囲 (cm)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="0.0"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>メモ</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="備考など"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose} data-sentry-unmask>
                                キャンセル
                            </Button>
                            <Button type="submit" loading={isSubmitting} data-sentry-unmask>
                                {isSubmitting ? "保存中..." : (record ? "更新" : "保存")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
