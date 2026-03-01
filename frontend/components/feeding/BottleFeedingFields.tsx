import React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
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
                                "flex-1 rounded-lg border py-2 text-xs font-medium transition-colors",
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
                            <Input type="number" step="10" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    )
}
