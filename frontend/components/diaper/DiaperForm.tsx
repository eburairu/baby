"use client"

import { Droplets, Biohazard } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { formatDateTimeLocal } from "@/lib/dateUtils"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Diaper, DiaperType, DiaperUpdate, DiaperCreate } from "@/types/diaper"
import { cn } from "@/lib/utils"
import { ErrorMessage } from "@/components/ui/error-message"
import { UI_BUTTONS, UI_FORMS } from "@/constants/ui-colors"
import { diaperSchema, DiaperFormValues } from "@/schemas/diaper"
import { useBaseRecordForm } from "@/hooks/useBaseRecordForm"
import { api } from "@/lib/api"
import { PoopDetailsFields } from "./PoopDetailsFields"
import { resolvePoopField } from "@/lib/diaperPoopUtils"


interface Props {
    babyId: string | number
    initialData?: Diaper
    defaultDiaperType?: DiaperType
    onSuccess: (recordId?: number) => void
    onUpdate?: (id: number, data: DiaperUpdate) => Promise<Diaper | undefined>
}

interface DiaperTypeButtonProps {
    type: DiaperType;
    selectedType: DiaperType;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

function DiaperTypeButton({ type, selectedType, onClick, icon, label }: DiaperTypeButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selectedType === type}
            aria-label={`おむつの種類: ${label}`}
            className={cn(
                "h-20 w-full flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selectedType === type
                    ? UI_FORMS.selection.amberBordered.active
                    : UI_FORMS.selection.amberBordered.inactive
            )}
        >
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </button>
    )
}

const EMPTY_POOP_VALUES = {
    poop_color: "",
    custom_poop_color: "",
    poop_consistency: "",
    custom_poop_consistency: "",
    poop_amount: "",
    custom_poop_amount: "",
}

function buildPoopPayload(vals: DiaperFormValues): { poop_color: string | null; poop_consistency: string | null; poop_amount: string | null } {
    if (vals.diaper_type === DiaperType.WET) {
        return { poop_color: null, poop_consistency: null, poop_amount: null }
    }
    return {
        poop_color: resolvePoopField(vals.poop_color, vals.custom_poop_color),
        poop_consistency: resolvePoopField(vals.poop_consistency, vals.custom_poop_consistency),
        poop_amount: resolvePoopField(vals.poop_amount, vals.custom_poop_amount),
    }
}

export function DiaperForm({ babyId, initialData, defaultDiaperType, onSuccess, onUpdate }: Props) {
    const isEditing = !!initialData

    const form = useForm<DiaperFormValues>({
        resolver: zodResolver(diaperSchema),
        defaultValues: {
            diaper_type: initialData?.diaper_type ?? defaultDiaperType ?? DiaperType.WET,
            change_time: initialData?.change_time
                ? formatDateTimeLocal(initialData.change_time)
                : formatDateTimeLocal(new Date()),
            notes: initialData?.notes ?? "",
            poop_color: initialData?.poop_color ?? "",
            custom_poop_color: "",
            poop_consistency: initialData?.poop_consistency ?? "",
            custom_poop_consistency: "",
            poop_amount: initialData?.poop_amount ?? "",
            custom_poop_amount: "",
        },
    })

    const selectedType = useWatch({ control: form.control, name: "diaper_type" })

    const { submitRecord, isSubmitting, error } = useBaseRecordForm<DiaperFormValues>({
        endpoint: "/diapers/",
        babyId,
        onSuccess: (data) => {
            if (!isEditing) {
                form.reset({
                    diaper_type: DiaperType.WET,
                    change_time: formatDateTimeLocal(new Date()),
                    notes: "",
                    ...EMPTY_POOP_VALUES,
                })
            }
            onSuccess((data as { id?: number })?.id)
        },
        errorMessage: "エラーが発生しました。もう一度お試しください。",
        successMessage: isEditing ? "更新しました" : undefined
    })

    const onSubmit = async (values: DiaperFormValues) => {
        try {
            await submitRecord<DiaperCreate, Diaper | undefined>(values, (vals) => ({
                baby_id: Number(babyId),
                diaper_type: vals.diaper_type,
                change_time: new Date(vals.change_time).toISOString(),
                notes: vals.notes?.trim() || null,
                ...buildPoopPayload(vals),
            }),
            isEditing && initialData ? async (payload: DiaperCreate) => {
                const updatePayload: DiaperUpdate = {
                    diaper_type: payload.diaper_type,
                    change_time: payload.change_time,
                    notes: payload.notes,
                    poop_color: payload.poop_color,
                    poop_consistency: payload.poop_consistency,
                    poop_amount: payload.poop_amount,
                }

                if (onUpdate) {
                    return await onUpdate(initialData.id, updatePayload)
                } else {
                    return await api.put<Diaper>(`/diapers/${initialData.id}`, updatePayload)
                }
            } : undefined)
        } catch (e) {
            // Error is handled by the hook
            console.error(e)
        }
    }

    return (
        <Card className={cn("rounded-2xl shadow-sm border-0 mb-6 transition-colors", isEditing && "mb-0 shadow-none")}>
            <CardContent className={cn("pt-6", isEditing && "p-0")}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <DiaperTypeButton
                                type={DiaperType.WET}
                                selectedType={selectedType}
                                onClick={() => form.setValue("diaper_type", DiaperType.WET)}
                                icon={<Droplets className="w-6 h-6" />}
                                label="おしっこ"
                            />
                            <DiaperTypeButton
                                type={DiaperType.DIRTY}
                                selectedType={selectedType}
                                onClick={() => form.setValue("diaper_type", DiaperType.DIRTY)}
                                icon={<Biohazard className="w-6 h-6" />}
                                label="うんち"
                            />
                            <DiaperTypeButton
                                type={DiaperType.BOTH}
                                selectedType={selectedType}
                                onClick={() => form.setValue("diaper_type", DiaperType.BOTH)}
                                icon={<span className="flex gap-0.5"><Droplets className="w-6 h-6" /><Biohazard className="w-6 h-6" /></span>}
                                label="両方"
                            />
                        </div>

                        {selectedType !== DiaperType.WET && (
                            <PoopDetailsFields form={form} />
                        )}

                        <FormField
                            control={form.control}
                            name="change_time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground">記録日時</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
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
                                    <FormLabel className="text-xs text-muted-foreground">メモ</FormLabel>
                                    <FormControl>
                                        <Input placeholder="その他のメモ..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {error && <ErrorMessage message={error} />}

                        <Button
                            type="submit"
                            className={cn("w-full rounded-xl h-11", UI_BUTTONS.primary)}
                            loading={isSubmitting}
                            data-sentry-unmask
                        >
                            {isEditing ? "更新する" : "保存する"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
