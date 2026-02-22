"use client"
import { useForm } from "react-hook-form"
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
} from "@/components/ui/form"

const babySchema = z.object({
    name: z.string().min(1, "名前を入力してください"),
    gender: z.enum(["boy", "girl", "unknown"]).optional(),
    birthday: z.string().optional(),
    due_date: z.string().optional(),
    characteristics: z.string().optional(),
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
        resolver: zodResolver(babySchema),
        defaultValues: {
            name: "",
            gender: "unknown",
            birthday: "",
            due_date: "",
            characteristics: "",
            ...defaultValues,
        },
        values: defaultValues ? {
            name: defaultValues.name || "",
            gender: defaultValues.gender || "unknown",
            birthday: defaultValues.birthday || "",
            due_date: defaultValues.due_date || "",
            characteristics: defaultValues.characteristics || "",
        } : undefined,
    })

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

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        キャンセル
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {submitLabel}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
