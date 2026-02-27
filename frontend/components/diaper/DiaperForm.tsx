"use client"

import { POOP_COLORS, POOP_AMOUNTS } from "@/constants/diaper"

import { Droplets, Biohazard } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Diaper, DiaperType, DiaperUpdate, DiaperCreate } from "@/types/diaper"
import { cn } from "@/lib/utils"
import { ErrorMessage } from "@/components/ui/error-message"
import { UI_BUTTONS, UI_FORMS } from "@/constants/ui-colors"
import { diaperSchema, DiaperFormValues } from "@/schemas/diaper"
import { useBaseRecordForm } from "@/hooks/useBaseRecordForm"
import { useDiapers } from "@/hooks/useDiaper"


interface Props {
    babyId: string | number
    initialData?: Diaper
    onSuccess: (recordId?: number) => void
    onUpdate?: (id: number, data: DiaperUpdate) => Promise<Diaper | undefined>
}

export function DiaperForm({ babyId, initialData, onSuccess, onUpdate }: Props) {
    const isEditing = !!initialData
    const { addDiaper, updateDiaper } = useDiapers(babyId)

    const form = useForm<DiaperFormValues>({
        resolver: zodResolver(diaperSchema),
        defaultValues: {
            diaper_type: initialData?.diaper_type ?? DiaperType.WET,
            change_time: initialData?.change_time
                ? format(new Date(initialData.change_time), "yyyy-MM-dd'T'HH:mm")
                : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            notes: initialData?.notes ?? "",
            poop_color: "",
            custom_poop_color: "",
            poop_amount: "",
            custom_poop_amount: "",
        },
    })

    const selectedType = form.watch("diaper_type")
    const selectedColor = form.watch("poop_color")
    const selectedAmount = form.watch("poop_amount")

    const { submitRecord, isSubmitting, error } = useBaseRecordForm<DiaperFormValues>({
        babyId,
        onSuccess: (data) => {
            if (!isEditing) {
                form.reset({
                    diaper_type: DiaperType.WET,
                    change_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                    notes: "",
                    poop_color: "",
                    custom_poop_color: "",
                    poop_amount: "",
                    custom_poop_amount: "",
                })
            }
            onSuccess((data as { id?: number })?.id)
        },
        errorMessage: "エラーが発生しました。もう一度お試しください。",
        successMessage: isEditing ? "更新しました" : undefined
    })

    const onSubmit = async (values: DiaperFormValues) => {
        try {
            await submitRecord<DiaperCreate, Diaper | undefined>(values, (vals) => {
                let finalNotes = vals.notes || ""
                if (vals.diaper_type !== DiaperType.WET) {
                    const color = vals.poop_color === "その他" ? vals.custom_poop_color : vals.poop_color
                    const amount = vals.poop_amount === "その他" ? vals.custom_poop_amount : vals.poop_amount

                    if (!initialData && (color || amount)) {
                        const prefixParts = []
                        if (color) prefixParts.push(`色: ${color}`)
                        if (amount) prefixParts.push(`量: ${amount}`)
                        const prefix = prefixParts.join("、")

                        if (prefix) {
                            finalNotes = prefix + (finalNotes ? "、" + finalNotes : "")
                        }
                    }
                }
                return {
                    baby_id: Number(babyId),
                    diaper_type: vals.diaper_type,
                    change_time: new Date(vals.change_time).toISOString(),
                    notes: finalNotes.trim() || null,
                }
            },
            isEditing && initialData ? async (payload: DiaperCreate) => {
                 const updatePayload: DiaperUpdate = {
                     diaper_type: payload.diaper_type,
                     change_time: payload.change_time,
                     notes: payload.notes
                 };

                 if (onUpdate) {
                     return await onUpdate(initialData.id, updatePayload)
                 }
                 return await updateDiaper(initialData.id, updatePayload)
            } : addDiaper)
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
                            <button
                                type="button"
                                onClick={() => form.setValue("diaper_type", DiaperType.WET)}
                                className={cn(
                                    "h-20 w-full flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-colors",
                                    selectedType === DiaperType.WET
                                        ? UI_FORMS.selection.amberBordered.active
                                        : UI_FORMS.selection.amberBordered.inactive
                                )}
                            >
                                <Droplets className="w-6 h-6" />
                                <span className="text-xs font-medium">おしっこ</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => form.setValue("diaper_type", DiaperType.DIRTY)}
                                className={cn(
                                    "h-20 w-full flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-colors",
                                    selectedType === DiaperType.DIRTY
                                        ? UI_FORMS.selection.amberBordered.active
                                        : UI_FORMS.selection.amberBordered.inactive
                                )}
                            >
                                <Biohazard className="w-6 h-6" />
                                <span className="text-xs font-medium">うんち</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => form.setValue("diaper_type", DiaperType.BOTH)}
                                className={cn(
                                    "h-20 w-full flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-colors",
                                    selectedType === DiaperType.BOTH
                                        ? UI_FORMS.selection.amberBordered.active
                                        : UI_FORMS.selection.amberBordered.inactive
                                )}
                            >
                                <span className="flex gap-0.5"><Droplets className="w-6 h-6" /><Biohazard className="w-6 h-6" /></span>
                                <span className="text-xs font-medium">両方</span>
                            </button>
                        </div>

                        {selectedType !== DiaperType.WET && (
                            <div className="space-y-4 pt-2 border-t border-muted/20 mt-2">
                                <FormField
                                    control={form.control}
                                    name="poop_color"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs text-muted-foreground">うんちの色</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    className="flex flex-wrap gap-2"
                                                >
                                                    {POOP_COLORS.map((color) => (
                                                        <div key={color} className="flex items-center">
                                                            <RadioGroupItem value={color} id={`color-${color}`} className="sr-only" />
                                                            <Label
                                                                htmlFor={`color-${color}`}
                                                                className={cn(
                                                                    "px-3 py-1.5 rounded-full border text-xs cursor-pointer transition-all",
                                                                    field.value === color
                                                                        ? "bg-amber-500 border-amber-500 text-white font-medium shadow-sm"
                                                                        : "bg-white border-muted text-muted-foreground hover:border-amber-200"
                                                                )}
                                                            >
                                                                {color}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {selectedColor === "その他" && (
                                    <FormField
                                        control={form.control}
                                        name="custom_poop_color"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="具体的な色を入力..." {...field} className="h-9 text-sm rounded-lg" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="poop_amount"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs text-muted-foreground">うんちの量</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    className="flex flex-wrap gap-2"
                                                >
                                                    {POOP_AMOUNTS.map((amount) => (
                                                        <div key={amount} className="flex items-center">
                                                            <RadioGroupItem value={amount} id={`amount-${amount}`} className="sr-only" />
                                                            <Label
                                                                htmlFor={`amount-${amount}`}
                                                                className={cn(
                                                                    "px-3 py-1.5 rounded-full border text-xs cursor-pointer transition-all",
                                                                    field.value === amount
                                                                        ? "bg-amber-500 border-amber-500 text-white font-medium shadow-sm"
                                                                        : "bg-white border-muted text-muted-foreground hover:border-amber-200"
                                                                )}
                                                            >
                                                                {amount}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {selectedAmount === "その他" && (
                                    <FormField
                                        control={form.control}
                                        name="custom_poop_amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="具体的な量を入力..." {...field} className="h-9 text-sm rounded-lg" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
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
                                        <Input placeholder="色や量など..." {...field} />
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
                            {isSubmitting ? "保存中..." : isEditing ? "更新する" : "保存する"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
