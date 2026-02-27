"use client"

import { Feeding, FeedingUpdate } from "@/types/feeding"
import { FeedingForm } from "./feeding-form"
import { Pencil } from "lucide-react"
import { EditDialogBase } from "@/components/records/EditDialogBase"

interface FeedingEditDialogProps {
    feeding: Feeding | null
    open: boolean
    onOpenChange: (open: boolean) => void
    babyId?: number
    onUpdate?: (id: number, data: FeedingUpdate) => Promise<Feeding | undefined>
    onSuccess: () => void
}

export function FeedingEditDialog({ feeding, open, onOpenChange, babyId, onUpdate, onSuccess }: FeedingEditDialogProps) {
    if (!feeding || !babyId) return null

    return (
        <EditDialogBase
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <Pencil className="w-5 h-5 text-indigo-500" />
                    授乳記録の編集
                </>
            }
        >
            <FeedingForm
                babyId={babyId}
                initialData={feeding}
                onUpdate={onUpdate}
                onSuccess={() => {
                    onSuccess()
                    onOpenChange(false)
                }}
            />
        </EditDialogBase>
    )
}
