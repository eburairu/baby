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

interface Props {
    open: boolean
    onClose: () => void
    onAdded: () => void
}

export function AddBabyDialog({ open, onClose, onAdded }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleClose = () => {
        setError(null)
        onClose()
    }

    const onSubmit = async (data: BabyFormData) => {
        setIsSubmitting(true)
        setError(null)
        try {
            await api.post("/babies/", {
                name: data.name,
                birthday: data.birthday || null,
                due_date: data.due_date || null,
                gender: data.gender || "unknown",
                characteristics: data.characteristics || null,
            })
            onAdded()
            handleClose()
        } catch {
            setError("追加に失敗しました")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>赤ちゃんを追加</DialogTitle>
                </DialogHeader>
                <BabyForm
                    onSubmit={onSubmit}
                    onCancel={handleClose}
                    submitLabel="追加"
                    isSubmitting={isSubmitting}
                    error={error}
                    defaultValues={{ gender: "unknown" }}
                />
            </DialogContent>
        </Dialog>
    )
}
