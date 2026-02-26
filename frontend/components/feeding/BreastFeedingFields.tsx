import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { FeedingFormValues } from "@/schemas/feeding"

interface BreastFeedingFieldsProps {
    form: UseFormReturn<FeedingFormValues>
    setLeftSeconds: (seconds: number) => void
    setRightSeconds: (seconds: number) => void
}

export function BreastFeedingFields({ form, setLeftSeconds, setRightSeconds }: BreastFeedingFieldsProps) {
    return (
        <div className="grid grid-cols-2 gap-3">
            <FormField
                control={form.control}
                name="left_breast_minutes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs">左 (分)</FormLabel>
                        <FormControl>
                            <Input type="number" min="0" {...field} onChange={e => {
                                field.onChange(e)
                                const val = parseInt(e.target.value) || 0
                                setLeftSeconds(val * 60)
                            }} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="right_breast_minutes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs">右 (分)</FormLabel>
                        <FormControl>
                            <Input type="number" min="0" {...field} onChange={e => {
                                field.onChange(e)
                                const val = parseInt(e.target.value) || 0
                                setRightSeconds(val * 60)
                            }} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}
