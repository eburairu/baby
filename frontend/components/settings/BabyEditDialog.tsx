"use client"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { BabyForm, BabyFormData } from "./BabyForm"
import { Baby } from "@/types/baby"

interface Props {
    baby: Baby | null
    open: boolean
    onClose: () => void
    onUpdated: () => void
}

export function BabyEditDialog({ baby, open, onClose, onUpdated }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleClose = () => {
        setError(null)
        onClose()
    }

    const onSubmit = async (data: BabyFormData) => {
        if (!baby) return
        setIsSubmitting(true)
        setError(null)
        try {
            await api.patch(`/babies/${baby.id}`, {
                name: data.name,
                birthday: data.birthday || null,
                due_date: data.due_date || null,
                gender: data.gender || "unknown",
                characteristics: data.characteristics || null,
            })
            onUpdated()
            handleClose()
        } catch {
            setError("保存に失敗しました")
        } finally {
            setIsSubmitting(false)
        }
    }

    const defaultValues: Partial<BabyFormData> | undefined = baby ? {
        name: baby.name,
        gender: (baby.gender as "boy" | "girl" | "unknown") || "unknown",
        birthday: baby.birthday ?? "",
        due_date: baby.due_date ?? "",
        characteristics: baby.characteristics ?? "",
    } : undefined

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>赤ちゃんの情報を編集</DialogTitle>
                </DialogHeader>
                <BabyForm
                    defaultValues={defaultValues}
                    onSubmit={onSubmit}
                    onCancel={handleClose}
                    submitLabel="保存"
                    isSubmitting={isSubmitting}
                    error={error}
                />
            </DialogContent>
        </Dialog>
    )
}
