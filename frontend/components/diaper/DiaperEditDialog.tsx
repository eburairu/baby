"use client"

import { Diaper } from "@/types/diaper"
import { EditDialogBase } from "@/components/records/EditDialogBase"
import { DiaperForm } from "./DiaperForm"

interface Props {
    diaper: Diaper | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function DiaperEditDialog({ diaper, open, onOpenChange, onSuccess }: Props) {
    if (!diaper) return null

    return (
        <EditDialogBase
            open={open}
            onOpenChange={onOpenChange}
            title="記録の編集"
        >
            <DiaperForm
                babyId={diaper.baby_id}
                initialData={diaper}
                onSuccess={() => {
                    onSuccess()
                    onOpenChange(false)
                }}
            />
        </EditDialogBase>
    )
}
