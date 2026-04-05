"use client"
import { useState } from "react"
import { EditDialogBase } from "@/components/records/EditDialogBase"
import { api, getErrorMessage } from "@/lib/api"
import { BabyForm, BabyFormData } from "./BabyForm"
import { Baby } from "@/types/baby"
import { useAsyncAction } from "@/hooks/useAsyncAction"

interface Props {
    baby: Baby | null
    open: boolean
    onClose: () => void
    onUpdated: () => void
}

export function BabyEditDialog({ baby, open, onClose, onUpdated }: Props) {
    const [error, setError] = useState<string | null>(null)
    const { loading: isSubmitting, execute } = useAsyncAction()

    const handleClose = () => {
        setError(null)
        onClose()
    }

    const onSubmit = async (data: BabyFormData) => {
        if (!baby) return
        setError(null)

        await execute(
            async () => {
                await api.patch(`/babies/${baby.id}`, {
                    name: data.name,
                    birthday: data.birthday || null,
                    due_date: data.due_date || null,
                    gender: data.gender || "unknown",
                    characteristics: data.characteristics || null,
                    feeding_threshold_minutes: data.feeding_threshold_minutes,
                    diaper_threshold_minutes: data.diaper_threshold_minutes,
                    instagram_username: data.instagram_username || null,
                })
                onUpdated()
                handleClose()
            },
            {
                onError: (err) => {
                    setError(getErrorMessage(err, "保存に失敗しました"))
                }
            }
        )
    }

    const defaultValues: Partial<BabyFormData> | undefined = baby ? {
        name: baby.name,
        gender: (baby.gender as "boy" | "girl" | "unknown") || "unknown",
        birthday: baby.birthday ?? "",
        due_date: baby.due_date ?? "",
        characteristics: baby.characteristics ?? "",
        feeding_threshold_minutes: baby.feeding_threshold_minutes ?? null,
        diaper_threshold_minutes: baby.diaper_threshold_minutes ?? null,
        instagram_username: baby.instagram_username ?? "",
    } : undefined

    return (
        <EditDialogBase
            open={open}
            onOpenChange={(v) => { if (!v) handleClose() }}
            title="赤ちゃんの情報を編集"
            dialogClassName="max-h-[90vh] flex flex-col"
            contentClassName="flex-1 overflow-y-auto"
        >
            <div className="pt-2">
                <BabyForm
                    defaultValues={defaultValues}
                    onSubmit={onSubmit}
                    onCancel={handleClose}
                    submitLabel="保存"
                    isSubmitting={isSubmitting}
                    error={error}
                />
            </div>
        </EditDialogBase>
    )
}
