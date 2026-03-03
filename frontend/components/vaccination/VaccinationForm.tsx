"use client"

import { useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { formatDateLocal } from "@/lib/dateUtils"
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
import { Switch } from "@/components/ui/switch"
import { api } from "@/lib/api"
import { Vaccination } from "@/types/vaccination"
import { vaccinationSchema, VaccinationFormValues } from "@/schemas/vaccination"
import { useBaseRecordForm } from "@/hooks/useBaseRecordForm"
import { NATIVE_SELECT_CLASS } from "@/constants/ui"

interface VaccinationFormProps {
    babyId: number
    record?: Vaccination | null
    isOpen: boolean
    onClose: () => void
    onSuccess: (recordId?: number) => void
}

export function VaccinationForm({
    babyId,
    record,
    isOpen,
    onClose,
    onSuccess,
}: VaccinationFormProps) {
    const isEditing = !!record

    const defaultValues: VaccinationFormValues = useMemo(() => {
        if (record) {
            return {
                vaccine_name: record.vaccine_name,
                dose_number: record.dose_number,
                status: record.status as "scheduled" | "completed" | "postponed",
                scheduled_date: record.scheduled_date,
                completed_date: record.completed_date || null,
                lot_number: record.lot_number || "",
                hospital_name: record.hospital_name || "",
                has_side_effect: record.has_side_effect || false,
                notes: record.notes || "",
            }
        }
        return {
            vaccine_name: "",
            dose_number: 1,
            status: "scheduled",
            scheduled_date: formatDateLocal(new Date()),
            completed_date: null,
            lot_number: "",
            hospital_name: "",
            has_side_effect: false,
            notes: "",
        }
    }, [record])

    const form = useForm<VaccinationFormValues>({
        resolver: zodResolver(vaccinationSchema),
        defaultValues,
        values: defaultValues,
    })

    const status = useWatch({ control: form.control, name: "status" })

    const { submitRecord, isSubmitting } = useBaseRecordForm<VaccinationFormValues>({
        endpoint: `/vaccinations/`,
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

    const onSubmit = async (values: VaccinationFormValues) => {
        await submitRecord(
            values,
            (vals, base) => ({ ...vals, baby_id: base.baby_id }),
            async (payload) => {
                if (isEditing) {
                    return await api.patch(`/vaccinations/${record!.id}`, payload)
                } else {
                    return await api.post<{ id: number }>(`/vaccinations/?baby_id=${babyId}`, payload)
                }
            }
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{record ? "予防接種を編集" : "新しい予防接種を追加"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="vaccine_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ワクチン名</FormLabel>
                                        <FormControl>
                                            <Input placeholder="例: ヒブ" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dose_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>回数</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                {...field} 
                                                onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>状態</FormLabel>
                                    <FormControl>
                                        <select
                                            className={NATIVE_SELECT_CLASS}
                                            value={field.value}
                                            onChange={field.onChange}
                                        >
                                            <option value="scheduled">予定</option>
                                            <option value="completed">完了</option>
                                            <option value="postponed">延期</option>
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="scheduled_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>予定日</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {status === "completed" && (
                                <FormField
                                    control={form.control}
                                    name="completed_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>接種日</FormLabel>
                                            <FormControl>
                                                <Input type="date" value={field.value || ""} onChange={field.onChange} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        {status === "completed" && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="lot_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ロット番号</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="ABC1234" {...field} value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="hospital_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>医療機関名</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="〇〇こどもクリニック" {...field} value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="has_side_effect"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>副反応あり</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>メモ</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="特記事項など"
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
