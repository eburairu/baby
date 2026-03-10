"use client"

import { Temperature } from "@/types/temperature"
import { EditDialogBase } from "@/components/records/EditDialogBase"
import { TemperatureForm } from "./TemperatureForm"

interface Props {
    temperature: Temperature | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function TemperatureEditDialog({ temperature, open, onOpenChange, onSuccess }: Props) {
    if (!temperature) return null

    return (
        <EditDialogBase open={open} onOpenChange={onOpenChange} title="体温の編集">
            <TemperatureForm
                babyId={temperature.baby_id}
                initialData={temperature}
                onSuccess={() => {
                    onSuccess()
                    onOpenChange(false)
                }}
            />
        </EditDialogBase>
    )
}
