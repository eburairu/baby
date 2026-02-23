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

const diaperSchema = z.object({
    diaper_type: z.nativeEnum(DiaperType),
    change_time: z.string(),
    notes: z.string().optional(),
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
        },
    })

    const selectedType = form.watch("diaper_type")

    const onSubmit = async (values: DiaperFormValues) => {
        setIsSubmitting(true)
        setError(null)
        try {
            const newRecord = await api.post<{ id: number }>("/diapers/", {
                baby_id: Number(babyId),
                diaper_type: values.diaper_type,
                change_time: new Date(values.change_time).toISOString(),
                notes: values.notes || undefined,
            })
            form.reset({
                diaper_type: DiaperType.WET,
                change_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                notes: "",
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
                                <span className="text-2xl">💧</span>
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
                                <span className="text-2xl">💩</span>
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
                                <span className="text-2xl">💧💩</span>
                                <span className="text-xs font-medium">両方</span>
                            </button>
                        </div>

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
