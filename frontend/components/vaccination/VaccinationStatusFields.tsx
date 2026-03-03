import React from "react"
import { UseFormReturn, useWatch } from "react-hook-form"
import { VaccinationFormValues } from "@/schemas/vaccination"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface VaccinationStatusFieldsProps {
    form: UseFormReturn<VaccinationFormValues>
}

export function VaccinationStatusFields({ form }: VaccinationStatusFieldsProps) {
    const status = useWatch({ control: form.control, name: "status" })

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="scheduled_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>予定日</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {status === "completed" && (
                    <FormField
                        control={form.control}
                        name="completed_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>接種日</FormLabel>
                                <FormControl>
                                    <Input type="date" value={field.value || ""} onChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </div>

            {status === "completed" && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="lot_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ロット番号</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ABC1234" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="hospital_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>医療機関名</FormLabel>
                                    <FormControl>
                                        <Input placeholder="〇〇こどもクリニック" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="has_side_effect"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>副反応あり</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </>
            )}
        </>
    )
}
