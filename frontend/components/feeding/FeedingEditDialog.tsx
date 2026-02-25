"use client"

import { Feeding, FeedingUpdate } from "@/types/feeding"
import { FeedingForm } from "./feeding-form"
import { Pencil } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-0 sm:border rounded-2xl">
                <DialogHeader className="p-4 border-b bg-slate-50 dark:bg-zinc-900/50">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        <Pencil className="w-5 h-5 text-indigo-500" />
                        授乳記録の編集
                    </DialogTitle>
                </DialogHeader>
                <div className="p-4 max-h-[80vh] overflow-y-auto">
                    <FeedingForm
                        babyId={babyId}
                        initialData={feeding}
                        onUpdate={onUpdate}
                        onSuccess={() => {
                            onSuccess()
                            onOpenChange(false)
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
