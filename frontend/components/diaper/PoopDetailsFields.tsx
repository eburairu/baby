import React from "react"
import { UseFormReturn, useWatch } from "react-hook-form"
import { DiaperFormValues } from "@/schemas/diaper"
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { POOP_COLORS, POOP_CONSISTENCIES, POOP_AMOUNTS } from "@/constants/diaper"
import { cn } from "@/lib/utils"

interface PoopDetailsFieldsProps {
    form: UseFormReturn<DiaperFormValues>
}

function PoopRadioGroup({
    name,
    legend,
    options,
    form,
}: {
    name: "poop_color" | "poop_consistency" | "poop_amount"
    legend: string
    options: readonly string[]
    form: UseFormReturn<DiaperFormValues>
}) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="space-y-2">
                    <fieldset>
                        <legend className="text-xs text-muted-foreground">{legend}</legend>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex flex-wrap gap-2"
                            >
                                {options.map((option) => (
                                    <div key={option} className="flex items-center">
                                        <RadioGroupItem value={option} id={`${name}-${option}`} className="sr-only peer" />
                                        <Label
                                            htmlFor={`${name}-${option}`}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full border text-xs cursor-pointer transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                                                field.value === option
                                                    ? "bg-amber-500 border-amber-500 text-white font-medium shadow-sm"
                                                    : "bg-white border-muted text-muted-foreground hover:border-amber-200"
                                            )}
                                        >
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </fieldset>
                </FormItem>
            )}
        />
    )
}

export function PoopDetailsFields({ form }: PoopDetailsFieldsProps) {
    const selectedColor = useWatch({ control: form.control, name: "poop_color" })
    const selectedConsistency = useWatch({ control: form.control, name: "poop_consistency" })
    const selectedAmount = useWatch({ control: form.control, name: "poop_amount" })

    return (
        <div className="space-y-4 pt-2 border-t border-muted/20 mt-2">
            <PoopRadioGroup name="poop_color" legend="うんちの色" options={POOP_COLORS} form={form} />
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

            <PoopRadioGroup name="poop_consistency" legend="うんちの状態" options={POOP_CONSISTENCIES} form={form} />
            {selectedConsistency === "その他" && (
                <FormField
                    control={form.control}
                    name="custom_poop_consistency"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder="具体的な状態を入力..." {...field} className="h-9 text-sm rounded-lg" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            <PoopRadioGroup name="poop_amount" legend="うんちの量" options={POOP_AMOUNTS} form={form} />
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
    )
}
