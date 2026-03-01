import React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { UseFormReturn, useWatch } from "react-hook-form"
import { FeedingFormValues } from "@/schemas/feeding"
import { BOTTLE_CONTENT_TYPES } from "@/constants/feeding"
import { cn } from "@/lib/utils"
import { UI_FORMS } from "@/constants/ui-colors"

interface BottleFeedingFieldsProps {
    form: UseFormReturn<FeedingFormValues>
}

export function BottleFeedingFields({ form }: BottleFeedingFieldsProps) {
    const bottleContentType = useWatch({ control: form.control, name: "bottle_content_type" })

    return (
        <>
            <div>
                <p className="text-sm font-medium mb-2">種類</p>
                <div className="flex gap-2">
                    {BOTTLE_CONTENT_TYPES.map(({ value, label }) => (
                        <button
                            key={value}
                            type="button"
                            aria-pressed={bottleContentType === value}
                            onClick={() => form.setValue("bottle_content_type", bottleContentType === value ? null : (value as FeedingFormValues["bottle_content_type"]))}
                            className={cn(
                                "flex-1 rounded-lg border py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                bottleContentType === value
                                    ? UI_FORMS.selection.blueSolid.active
                                    : UI_FORMS.selection.blueSolid.inactive
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <FormField
                control={form.control}
                name="amount_ml"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>ミルク量 (ml)</FormLabel>
                        <FormControl>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        const current = Number(field.value) || 0;
                                        form.setValue("amount_ml", Math.max(0, current - 10), { shouldValidate: true });
                                    }}
                                    className="h-10 w-10 shrink-0"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Input type="number" step="10" {...field} className="text-center" />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        const current = Number(field.value) || 0;
                                        form.setValue("amount_ml", Math.min(500, current + 10), { shouldValidate: true });
                                    }}
                                    className="h-10 w-10 shrink-0"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    )
}
