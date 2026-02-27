"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { Milestone } from "@/types/milestone"
import { milestoneSchema, MilestoneFormValues } from "@/schemas/milestone"

interface MilestoneFormProps {
    babyId: number
    record?: Milestone | null
    isOpen: boolean
    onClose: () => void
    onSuccess: (recordId?: number) => void
}

const MILESTONE_PRESETS = [
    { value: "first_smile", label: "初めての笑顔" },
    { value: "rolling_over", label: "寝返り" },
    { value: "sitting_up", label: "お座り" },
    { value: "crawling", label: "はいはい" },
    { value: "standing_up", label: "つかまり立ち" },
    { value: "walking", label: "ひとり歩き" },
    { value: "first_word", label: "初めてのおしゃべり" },
    { value: "first_solid_food", label: "離乳食開始" },
    { value: "bye_bye", label: "バイバイ" },
    { value: "custom", label: "その他（自由入力）" },
]

export function MilestoneForm({
    babyId,
    record,
    isOpen,
    onClose,
    onSuccess,
}: MilestoneFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

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
            achieved_date: format(new Date(), "yyyy-MM-dd"),
            notes: "",
            image_urls: [],
        }
    }, [record])

    const form = useForm<MilestoneFormValues>({
        resolver: zodResolver(milestoneSchema),
        defaultValues,
        values: defaultValues,
    })

    const milestoneType = form.watch("milestone_type")

    const onSubmit = async (values: MilestoneFormValues) => {
        setIsSubmitting(true)
        try {
            const payload = {
                ...values,
                baby_id: babyId,
            }

            if (record) {
                await api.patch(`/milestones/${record.id}`, payload)
                onSuccess()
            } else {
                const newRecord = await api.post<{ id: number }>(`/milestones/?baby_id=${babyId}`, payload)
                onSuccess(newRecord?.id)
            }
            toast.success("記録しました")
            onClose()
        } catch (error) {
            console.error("Failed to save milestone record:", error)
            toast.error("保存に失敗しました")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{record ? "マイルストーンを編集" : "新しいマイルストーンを追加"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>タイトル</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="例: 初めて寝返りをした！"
                                            {...field}
                                            disabled={milestoneType !== "custom" && !!milestoneType}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "保存中..." : (record ? "更新" : "保存")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
