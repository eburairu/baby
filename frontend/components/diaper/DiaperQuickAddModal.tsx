"use client"

import { Droplets } from "lucide-react"
import { EditDialogBase } from "@/components/records/EditDialogBase"
import { DiaperForm } from "./DiaperForm"
import { DiaperType } from "@/types/diaper"

interface DiaperQuickAddModalProps {
    babyId: number
    defaultDiaperType?: DiaperType
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function DiaperQuickAddModal({
    babyId,
    defaultDiaperType,
    open,
    onOpenChange,
    onSuccess,
}: DiaperQuickAddModalProps) {
    return (
        <EditDialogBase
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <Droplets className="w-5 h-5 text-amber-500" />
                    おむつを記録
                </>
            }
        >
            <DiaperForm
                babyId={babyId}
                defaultDiaperType={defaultDiaperType}
                onSuccess={() => {
                    onOpenChange(false)
                    onSuccess?.()
                }}
            />
        </EditDialogBase>
    )
}
