"use client"

import { Heart } from "lucide-react"
import { EditDialogBase } from "@/components/records/EditDialogBase"
import { FeedingForm } from "./feeding-form"
import { BottleContentType, FeedingType } from "@/types/feeding"

interface FeedingQuickAddModalProps {
    babyId: number
    feedingType: FeedingType
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    lastMilkAmount?: number | null
    lastBottleContentType?: BottleContentType | null
}

export function FeedingQuickAddModal({
    babyId,
    feedingType,
    open,
    onOpenChange,
    onSuccess,
    lastMilkAmount,
    lastBottleContentType,
}: FeedingQuickAddModalProps) {
    return (
        <EditDialogBase
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <Heart className="w-5 h-5 text-rose-500" />
                    授乳を記録
                </>
            }
        >
            <FeedingForm
                babyId={babyId}
                defaultFeedingType={feedingType}
                lastMilkAmount={lastMilkAmount}
                lastBottleContentType={lastBottleContentType}
                onSuccess={() => {
                    onOpenChange(false)
                    onSuccess?.()
                }}
            />
        </EditDialogBase>
    )
}
