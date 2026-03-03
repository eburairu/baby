import React from "react"
import { UseFormReturn, useWatch } from "react-hook-form"
import { DiaperFormValues } from "@/schemas/diaper"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { POOP_COLORS, POOP_AMOUNTS } from "@/constants/diaper"
import { cn } from "@/lib/utils"

interface PoopDetailsFieldsProps {
    form: UseFormReturn<DiaperFormValues>
}

export function PoopDetailsFields({ form }: PoopDetailsFieldsProps) {
    const selectedColor = useWatch({ control: form.control, name: "poop_color" })
    const selectedAmount = useWatch({ control: form.control, name: "poop_amount" })

    return (
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
    )
}
