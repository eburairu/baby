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
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { Milestone } from "@/types/milestone"
import { milestoneSchema, MilestoneFormValues } from "@/schemas/milestone"
import { useBaseRecordForm } from "@/hooks/useBaseRecordForm"
import { MILESTONE_PRESETS } from "@/constants/milestone"
import { MilestoneTitleField } from "./MilestoneTitleField"

interface MilestoneFormProps {
    babyId: number
    record?: Milestone | null
    isOpen: boolean
    onClose: () => void
    onSuccess: (recordId?: number) => void
}

export function MilestoneForm({
    babyId,
    record,
    isOpen,
    onClose,
    onSuccess,
}: MilestoneFormProps) {
    const isEditing = !!record

    const defaultValues: MilestoneFormValues = useMemo(() => {
        if (record) {
            return {
                milestone_type: record.milestone_type,
                title: record.title,
                achieved_date: record.achieved_date,
                notes: record.notes || "",
                image_urls: record.image_urls || [],
            }
        }
        return {
            milestone_type: "",
            title: "",
            achieved_date: formatDateLocal(new Date()),
            notes: "",
            image_urls: [],
        }
    }, [record])

    const form = useForm<MilestoneFormValues>({
        resolver: zodResolver(milestoneSchema),
        defaultValues,
        values: defaultValues,
    })

    const { submitRecord, isSubmitting } = useBaseRecordForm<MilestoneFormValues>({
        endpoint: `/milestones/`,
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

    const onSubmit = async (values: MilestoneFormValues) => {
        await submitRecord(
            values,
            (vals, base) => ({ ...vals, baby_id: base.baby_id }),
            async (payload) => {
                if (isEditing) {
                    return await api.patch(`/milestones/${record!.id}`, payload)
                } else {
                    return await api.post<{ id: number }>(`/milestones/?baby_id=${babyId}`, payload)
                }
            }
        )
    }

    return (
        <EditDialogBase
            open={isOpen}
            onOpenChange={(open) => { if (!open) onClose() }}
            title={record ? "マイルストーンを編集" : "新しいマイルストーンを追加"}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="milestone_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>タイプ</FormLabel>
                                    <FormControl>
                                        <select
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={field.value}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                field.onChange(value)
                                                if (value !== "custom" && value !== "") {
                                                    const preset = MILESTONE_PRESETS.find(p => p.value === value)
                                                    if (preset) form.setValue("title", preset.label)
                                                }
                                            }}
                                        >
                                            <option value="" disabled>タイプを選択</option>
                                            {MILESTONE_PRESETS.map((preset) => (
                                                <option key={preset.value} value={preset.value}>
                                                    {preset.label}
                                                </option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <MilestoneTitleField form={form} />

                        <FormField
                            control={form.control}
                            name="achieved_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>達成日</FormLabel>
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

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>メモ</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="詳細な様子など"
                                            className="resize-none"
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            キャンセル
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            {isSubmitting ? "保存中..." : (record ? "更新" : "保存")}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </EditDialogBase>
    )
}
