"use client"

import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { formatDateLocal } from "@/lib/dateUtils"
import { Button } from "@/components/ui/button"
import { EditDialogBase } from "@/components/records/EditDialogBase"
import { DialogFooter } from "@/components/ui/dialog"
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
import { growthSchema, GrowthFormValues } from "@/schemas/growth"
import { useBaseRecordForm } from "@/hooks/useBaseRecordForm"

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
    const isEditing = !!record

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
            date: formatDateLocal(new Date()),
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

    const { submitRecord, isSubmitting } = useBaseRecordForm<GrowthFormValues>({
        endpoint: `/growths/`,
        babyId,
        onSuccess: (data: unknown) => {
            if (!isEditing) {
                onSuccess((data as { id: number })?.id)
            } else {
                onSuccess()
            }
            onClose()
        },
        successMessage: isEditing ? "更新しました" : "記録しました",
    })

    const onSubmit = async (values: GrowthFormValues) => {
        await submitRecord(
            values,
            (vals, base) => ({
                baby_id: base.baby_id,
                date: vals.date,
                height: vals.height ? parseFloat(vals.height) : null,
                weight: vals.weight ? parseInt(vals.weight) : null,
                head_circumference: vals.head_circumference ? parseFloat(vals.head_circumference) : null,
                notes: vals.notes || null,
            }),
            async (payload) => {
                if (isEditing) {
                    return await api.put(`/growths/${record!.id}`, payload)
                } else {
                    return await api.post<{ id: number }>("/growths/", payload)
                }
            }
        )
    }

    return (
        <EditDialogBase
            open={isOpen}
            onOpenChange={(open) => { if (!open) onClose() }}
            title={record ? "記録を編集" : "新しい記録を追加"}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            {record ? "更新" : "保存"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </EditDialogBase>
    )
}
