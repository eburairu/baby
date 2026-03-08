"use client"
import { useState } from "react"
import { EditDialogBase } from "@/components/records/EditDialogBase"
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
                feeding_threshold_minutes: data.feeding_threshold_minutes,
                diaper_threshold_minutes: data.diaper_threshold_minutes,
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
        <EditDialogBase
            open={open}
            onOpenChange={(v) => { if (!v) handleClose() }}
            title="赤ちゃんを追加"
            dialogClassName="max-h-[90vh] flex flex-col"
            contentClassName="flex-1 overflow-y-auto"
        >
            <div className="pt-2">
                <BabyForm
                    onSubmit={onSubmit}
                    onCancel={handleClose}
                    submitLabel="追加"
                    isSubmitting={isSubmitting}
                    error={error}
                    defaultValues={{ gender: "unknown" }}
                />
            </div>
        </EditDialogBase>
    )
}
