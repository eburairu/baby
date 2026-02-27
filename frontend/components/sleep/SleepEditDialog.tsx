"use client"

import { Sleep } from "@/types/sleep"
import { EditDialogBase } from "@/components/records/EditDialogBase"
import { SleepForm } from "./SleepForm"

interface SleepEditDialogProps {
    sleep: Sleep | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function SleepEditDialog({ sleep, open, onOpenChange, onSuccess }: SleepEditDialogProps) {
    if (!sleep) return null

    return (
        <EditDialogBase
            open={open}
            onOpenChange={onOpenChange}
            title="睡眠記録の編集"
        >
            <SleepForm
                babyId={sleep.baby_id}
                initialData={sleep}
                onSuccess={() => {
                    onSuccess()
                    onOpenChange(false)
                }}
            />
        </EditDialogBase>
    )
}
