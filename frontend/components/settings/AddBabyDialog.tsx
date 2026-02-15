"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"

const babySchema = z.object({
    name: z.string().min(1, "名前を入力してください"),
    birthday: z.string().optional(),
    due_date: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    characteristics: z.string().optional(),
})

type BabyFormData = z.infer<typeof babySchema>

interface Props {
    open: boolean
    onClose: () => void
    onAdded: () => void
}

export function AddBabyDialog({ open, onClose, onAdded }: Props) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<BabyFormData>({
        resolver: zodResolver(babySchema),
        defaultValues: { name: "", birthday: "", due_date: "" },
    })

    const handleClose = () => {
        reset()
        onClose()
    }

    const onSubmit = async (data: BabyFormData) => {
        try {
            await api.post("/babies/", {
                name: data.name,
                birthday: data.birthday || null,
                due_date: data.due_date || null,
                gender: data.gender || null,
                characteristics: data.characteristics || null,
            })
            onAdded()
            reset()
            onClose()
        } catch {
            setError("root", { message: "追加に失敗しました" })
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>赤ちゃんを追加</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <div className="space-y-1">
                        <Label htmlFor="add-name">名前 <span className="text-red-500">*</span></Label>
                        <Input id="add-name" {...register("name")} autoFocus />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="add-birthday">生年月日</Label>
                        <Input id="add-birthday" type="date" {...register("birthday")} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="add-due-date">出産予定日</Label>
                        <Input id="add-due-date" type="date" {...register("due_date")} />
                    </div>
                    <div className="space-y-1">
                        <Label>性別</Label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="radio" value="male" {...register("gender")} />
                                男の子
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="radio" value="female" {...register("gender")} />
                                女の子
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="radio" value="other" {...register("gender")} />
                                その他
                            </label>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="add-characteristics">特徴・傾向</Label>
                        <Textarea
                            id="add-characteristics"
                            {...register("characteristics")}
                            placeholder="赤ちゃんのペースや特徴があれば入力してください"
                            className="min-h-[100px]"
                        />
                    </div>
                    {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            キャンセル
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            追加
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
