"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { api } from "@/lib/api"
import { DiaperType } from "@/types/diaper"
import { cn } from "@/lib/utils"
import { ErrorMessage } from "@/components/ui/error-message"
import { UI_BUTTONS, UI_FORMS } from "@/constants/ui-colors"
import { SegmentedSelection } from "@/components/ui/segmented-selection"

const POOP_COLORS = ["黄色", "緑", "茶色", "黒", "白", "その他"] as const;
const POOP_AMOUNTS = ["少量", "普通", "多量", "その他"] as const;

const diaperSchema = z.object({
    diaper_type: z.nativeEnum(DiaperType),
    change_time: z.string().min(1, "記録日時は必須です"),
    notes: z.string().optional(),
    poop_color: z.string().optional(),
    custom_poop_color: z.string().optional(),
    poop_amount: z.string().optional(),
    custom_poop_amount: z.string().optional(),
})

type DiaperFormValues = z.infer<typeof diaperSchema>

interface Props {
    babyId: string
    onSuccess: (recordId?: number) => void
}

export function DiaperForm({ babyId, onSuccess }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<DiaperFormValues>({
        resolver: zodResolver(diaperSchema),
        defaultValues: {
            diaper_type: DiaperType.WET,
            change_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            notes: "",
            poop_color: "",
            custom_poop_color: "",
            poop_amount: "",
            custom_poop_amount: "",
        },
    })

    const selectedType = form.watch("diaper_type")
    const selectedColor = form.watch("poop_color")
    const selectedAmount = form.watch("poop_amount")

    const onSubmit = async (values: DiaperFormValues) => {
        setIsSubmitting(true)
        setError(null)
        try {
            let finalNotes = values.notes || ""

            if (values.diaper_type !== DiaperType.WET) {
                const color = values.poop_color === "その他" ? values.custom_poop_color : values.poop_color
                const amount = values.poop_amount === "その他" ? values.custom_poop_amount : values.poop_amount

                if (color || amount) {
                    const prefixParts = []
                    if (color) prefixParts.push(`色: ${color}`)
                    if (amount) prefixParts.push(`量: ${amount}`)
                    const prefix = prefixParts.join("、")
                    finalNotes = prefix + (finalNotes ? "、" + finalNotes : "")
                }
            }

            const newRecord = await api.post<{ id: number }>("/diapers/", {
                baby_id: Number(babyId),
                diaper_type: values.diaper_type,
                change_time: new Date(values.change_time).toISOString(),
                notes: finalNotes || undefined,
            })
            form.reset({
                diaper_type: DiaperType.WET,
                change_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                notes: "",
                poop_color: "",
                custom_poop_color: "",
                poop_amount: "",
                custom_poop_amount: "",
            })
            onSuccess(newRecord?.id)
        } catch (e) {
            console.error(e)
            setError("エラーが発生しました。もう一度お試しください。")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="rounded-2xl shadow-sm border-0 mb-6 transition-colors">
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <SegmentedSelection
                            options={[
                                { value: DiaperType.WET, label: <><span className="text-2xl">💧</span><span className="text-xs font-medium">おしっこ</span></> },
                                { value: DiaperType.DIRTY, label: <><span className="text-2xl">💩</span><span className="text-xs font-medium">うんち</span></> },
                                { value: DiaperType.BOTH, label: <><span className="text-2xl">💧💩</span><span className="text-xs font-medium">両方</span></> },
                            ]}
                            value={selectedType}
                            onChange={(val) => form.setValue("diaper_type", val)}
                            variant="amberBordered"
                            itemClassName="h-20 flex flex-col items-center justify-center gap-1 border-2"
                            className="mb-4"
                        />

                        {selectedType !== DiaperType.WET && (
                            <div className="space-y-4 pt-2 border-t border-muted/20 mt-2">
                                <FormField
                                    control={form.control}
                                    name="poop_color"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs text-muted-foreground">うんちの色</FormLabel>
                                            <FormControl>
                                                <SegmentedSelection
                                                    options={POOP_COLORS.map(color => ({ value: color, label: color }))}
                                                    value={field.value}
                                                    onChange={(val) => field.onChange(val)}
                                                    variant="amberSolid"
                                                    className="flex-wrap"
                                                    itemClassName="px-3 py-1.5 rounded-full flex-none w-auto"
                                                />
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
                                                <SegmentedSelection
                                                    options={POOP_AMOUNTS.map(amount => ({ value: amount, label: amount }))}
                                                    value={field.value}
                                                    onChange={(val) => field.onChange(val)}
                                                    variant="amberSolid"
                                                    className="flex-wrap"
                                                    itemClassName="px-3 py-1.5 rounded-full flex-none w-auto"
                                                />
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
                            {isSubmitting ? "保存中..." : "保存する"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
