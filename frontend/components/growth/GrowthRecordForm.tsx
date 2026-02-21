"use client"

import { useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

    const form = useForm<GrowthFormValues>({
        resolver: zodResolver(growthSchema),
        defaultValues: {
            date: format(new Date(), "yyyy-MM-dd"),
            height: "",
            weight: "",
            head_circumference: "",
            notes: "",
        },
    })

    useEffect(() => {
        if (record) {
            form.reset({
                date: record.date,
                height: record.height?.toString() || "",
                weight: record.weight?.toString() || "",
                head_circumference: record.head_circumference?.toString() || "",
                notes: record.notes || "",
            })
        } else {
            form.reset({
                date: format(new Date(), "yyyy-MM-dd"),
                height: "",
                weight: "",
                head_circumference: "",
                notes: "",
            })
        }
    }, [record, form, isOpen])

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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="date">計測日</Label>
                        <Input
                            id="date"
                            type="date"
                            max="9999-12-31"
                            {...form.register("date")}
                        />
                        {form.formState.errors.date && (
                            <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="height">身長 (cm)</Label>
                            <Input
                                id="height"
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                {...form.register("height")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="weight">体重 (g)</Label>
                            <Input
                                id="weight"
                                type="number"
                                placeholder="0"
                                {...form.register("weight")}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="head_circumference">頭囲 (cm)</Label>
                        <Input
                            id="head_circumference"
                            type="number"
                            step="0.1"
                            placeholder="0.0"
                            {...form.register("head_circumference")}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">メモ</Label>
                        <Input
                            id="notes"
                            placeholder="備考など"
                            {...form.register("notes")}
                        />
                    </div>

                    {form.formState.errors.height && (
                        <p className="text-xs text-destructive">{form.formState.errors.height.message}</p>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} data-sentry-unmask>
                            キャンセル
                        </Button>
                        <Button type="submit" loading={isSubmitting} data-sentry-unmask>
                            {isSubmitting ? "保存中..." : (record ? "更新" : "保存")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
