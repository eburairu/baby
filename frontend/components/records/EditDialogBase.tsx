"use client"

import { ReactNode } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface EditDialogBaseProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: ReactNode
    children: ReactNode
}

export function EditDialogBase({ open, onOpenChange, title, children }: EditDialogBaseProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-0 sm:border rounded-2xl dark:bg-zinc-900 dark:border-zinc-800">
                <DialogHeader className="p-4 border-b bg-slate-50 dark:bg-zinc-900/50">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2" data-sentry-unmask>
                        {title}
                    </DialogTitle>
                </DialogHeader>
                <div className="p-4 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    )
}
