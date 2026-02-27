"use client"

import { Sleep } from "@/types/sleep"
import { SleepForm } from "./sleep-form"
import { EditDialogBase } from "@/components/records/EditDialogBase"
import { Pencil } from "lucide-react"

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
            title={
                <>
                    <Pencil className="w-5 h-5 text-indigo-500" />
                    睡眠記録の編集
                </>
            }
        >
            <SleepForm
                babyId={String(sleep.baby_id)}
                initialData={sleep}
                onSuccess={() => {
                    onSuccess()
                    onOpenChange(false)
                }}
            />
        </EditDialogBase>
    )
}
