"use client"

import { Diaper } from "@/types/diaper"
import { DiaperForm } from "./DiaperForm"
import { EditDialogBase } from "@/components/records/EditDialogBase"
import { Pencil } from "lucide-react"

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
            title={
                <>
                    <Pencil className="w-5 h-5 text-indigo-500" />
                    記録の編集
                </>
            }
        >
            <DiaperForm
                babyId={String(diaper.baby_id)}
                initialData={diaper}
                onSuccess={() => {
                    onSuccess()
                    onOpenChange(false)
                }}
            />
        </EditDialogBase>
    )
}
