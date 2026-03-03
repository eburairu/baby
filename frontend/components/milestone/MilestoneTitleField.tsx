import React from "react"
import { UseFormReturn, useWatch } from "react-hook-form"
import { MilestoneFormValues } from "@/schemas/milestone"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface MilestoneTitleFieldProps {
    form: UseFormReturn<MilestoneFormValues>
}

export function MilestoneTitleField({ form }: MilestoneTitleFieldProps) {
    const milestoneType = useWatch({ control: form.control, name: "milestone_type" })

    return (
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
    )
}
