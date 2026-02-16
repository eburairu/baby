"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useEffect } from "react"

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
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<BabyFormData>({
        resolver: zodResolver(babySchema),
        defaultValues: {
            name: "",
            gender: "unknown",
            birthday: "",
            due_date: "",
            characteristics: "",
            ...defaultValues,
        },
    })

    const selectedGender = watch("gender")

    useEffect(() => {
        if (defaultValues) {
            reset({
                name: defaultValues.name || "",
                gender: defaultValues.gender || "unknown",
                birthday: defaultValues.birthday || "",
                due_date: defaultValues.due_date || "",
                characteristics: defaultValues.characteristics || "",
            })
        }
    }, [defaultValues, reset])

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1">
                <Label htmlFor="baby-name">名前 <span className="text-red-500">*</span></Label>
                <Input id="baby-name" {...register("name")} autoFocus />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label>性別</Label>
                <RadioGroup
                    value={selectedGender}
                    onValueChange={(v) => setValue("gender", v as "boy" | "girl" | "unknown")}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="boy" id="gender-boy" />
                        <Label htmlFor="gender-boy" className="cursor-pointer">男の子</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="girl" id="gender-girl" />
                        <Label htmlFor="gender-girl" className="cursor-pointer">女の子</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unknown" id="gender-unknown" />
                        <Label htmlFor="gender-unknown" className="cursor-pointer">わからない</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-1">
                <Label htmlFor="baby-birthday">生年月日</Label>
                <Input id="baby-birthday" type="date" max="9999-12-31" {...register("birthday")} />
            </div>

            <div className="space-y-1">
                <Label htmlFor="baby-due-date">出産予定日</Label>
                <Input id="baby-due-date" type="date" max="9999-12-31" {...register("due_date")} />
            </div>

            <div className="space-y-1">
                <Label htmlFor="baby-characteristics">特徴・傾向</Label>
                <Textarea
                    id="baby-characteristics"
                    {...register("characteristics")}
                    placeholder="赤ちゃんのペースや特徴、AIが生成した傾向などが表示されます。"
                    className="min-h-[100px]"
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
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    {submitLabel}
                </Button>
            </div>
        </form>
    )
}
