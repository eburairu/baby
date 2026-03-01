"use client"
import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { calcAge } from "@/lib/ageUtils"
import { resolveThreshold } from "@/lib/thresholdUtils"
import { ThresholdIndicatorPreview } from "./ThresholdIndicatorPreview"

const babySchema = z.object({
    name: z.string().min(1, "名前を入力してください"),
    gender: z.enum(["boy", "girl", "unknown"]).optional(),
    birthday: z.string().optional(),
    due_date: z.string().optional(),
    characteristics: z.string().optional(),
    feeding_threshold_minutes: z.preprocess((val) => (val === "" ? null : val), z.coerce.number().min(0).nullable()).optional() as z.ZodType<number | null | undefined>,
    diaper_threshold_minutes: z.preprocess((val) => (val === "" ? null : val), z.coerce.number().min(0).nullable()).optional() as z.ZodType<number | null | undefined>,
})

export type BabyFormData = z.infer<typeof babySchema>

interface Props {
    defaultValues?: Partial<BabyFormData>
    onSubmit: (data: BabyFormData) => Promise<void>
    onCancel: () => void
    submitLabel: string
    isSubmitting: boolean
    error?: string | null
}

export function BabyForm({
    defaultValues,
    onSubmit,
    onCancel,
    submitLabel,
    isSubmitting,
    error,
}: Props) {
    const form = useForm<BabyFormData>({
        resolver: zodResolver(babySchema) as unknown as Resolver<BabyFormData>,
        defaultValues: {
            name: "",
            gender: "unknown",
            birthday: "",
            due_date: "",
            characteristics: "",
            feeding_threshold_minutes: null,
            diaper_threshold_minutes: null,
            ...defaultValues,
        },
        values: defaultValues ? {
            name: defaultValues.name || "",
            gender: defaultValues.gender || "unknown",
            birthday: defaultValues.birthday || "",
            due_date: defaultValues.due_date || "",
            characteristics: defaultValues.characteristics || "",
            feeding_threshold_minutes: defaultValues.feeding_threshold_minutes ?? null,
            diaper_threshold_minutes: defaultValues.diaper_threshold_minutes ?? null,
        } : undefined,
    })

    const birthday = form.watch("birthday")
    const ageMonths = birthday ? calcAge(birthday).months : 0
    const defaultFeedingThreshold = resolveThreshold(ageMonths, null, "feeding")
    const defaultDiaperThreshold = resolveThreshold(ageMonths, null, "diaper")
    
    const feedingThresholdValue = form.watch("feeding_threshold_minutes")
    const diaperThresholdValue = form.watch("diaper_threshold_minutes")

    const activeFeedingThreshold = feedingThresholdValue ?? defaultFeedingThreshold
    const activeDiaperThreshold = diaperThresholdValue ?? defaultDiaperThreshold

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>名前 <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input {...field} autoFocus />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>性別</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex gap-4"
                                >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="boy" />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                            男の子
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="girl" />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                            女の子
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="unknown" />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                            わからない
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="birthday"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>生年月日</FormLabel>
                            <FormControl>
                                <Input type="date" max="9999-12-31" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>出産予定日</FormLabel>
                            <FormControl>
                                <Input type="date" max="9999-12-31" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="characteristics"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>特徴・傾向</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="赤ちゃんのペースや特徴、AIが生成した傾向などが表示されます。"
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="feeding_threshold_minutes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>授乳の警告閾値（分）</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        placeholder={`自動設定（${defaultFeedingThreshold}）`} 
                                        {...field} 
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <ThresholdIndicatorPreview thresholdMinutes={activeFeedingThreshold} />
                                <FormDescription>
                                    前回記録からの経過時間がこの分を超えると警告が表示されます。空欄の場合は自動設定が適用されます。
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="diaper_threshold_minutes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>おむつの警告閾値（分）</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        placeholder={`自動設定（${defaultDiaperThreshold}）`} 
                                        {...field} 
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <ThresholdIndicatorPreview thresholdMinutes={activeDiaperThreshold} />
                                <FormDescription>
                                    前回記録からの経過時間がこの分を超えると警告が表示されます。空欄の場合は自動設定が適用されます。
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        キャンセル
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        loading={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {submitLabel}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
