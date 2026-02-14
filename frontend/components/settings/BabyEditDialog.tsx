"use client"
import { useEffect } from "react"
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
    characteristics: z.string().optional(),
})

type BabyFormData = z.infer<typeof babySchema>

import { Baby } from "@/types/baby"

/* Removed local Baby interface */

interface Props {
    baby: Baby | null
    open: boolean
    onClose: () => void
    onUpdated: () => void
}

export function BabyEditDialog({ baby, open, onClose, onUpdated }: Props) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<BabyFormData>({
        resolver: zodResolver(babySchema),
    })

    useEffect(() => {
        if (baby && open) {
            reset({
                name: baby.name,
                birthday: baby.birthday ?? "",
                due_date: baby.due_date ?? "",
                characteristics: baby.characteristics ?? "",
            })
        }
    }, [baby, open, reset])

    const onSubmit = async (data: BabyFormData) => {
        if (!baby) return
        try {
            await api.patch(`/babies/${baby.id}`, {
                name: data.name,
                birthday: data.birthday || null,
                due_date: data.due_date || null,
                characteristics: data.characteristics || null,
            })
            onUpdated()
            onClose()
        } catch {
            setError("root", { message: "保存に失敗しました" })
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>赤ちゃんの情報を編集</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <div className="space-y-1">
                        <Label htmlFor="edit-name">名前 <span className="text-red-500">*</span></Label>
                        <Input id="edit-name" {...register("name")} autoFocus />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-birthday">生年月日</Label>
                        <Input id="edit-birthday" type="date" {...register("birthday")} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-due-date">出産予定日</Label>
                        <Input id="edit-due-date" type="date" {...register("due_date")} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-characteristics">特徴・傾向</Label>
                        <Textarea
                            id="edit-characteristics"
                            {...register("characteristics")}
                            placeholder="AIが生成した特徴が表示されます。手動で編集も可能です。"
                            className="min-h-[100px]"
                        />
                    </div>
                    {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            キャンセル
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            保存
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
