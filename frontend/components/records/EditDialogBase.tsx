"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface EditDialogBaseProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: ReactNode
    children: ReactNode
    className?: string
}

export function EditDialogBase({
    open,
    onOpenChange,
    title,
    children,
    className
}: EditDialogBaseProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn("max-w-md p-0 overflow-hidden border-0 sm:border rounded-2xl dark:bg-zinc-900 dark:border-zinc-800", className)}>
                <DialogHeader className="p-4 border-b bg-slate-50 dark:bg-zinc-900/50 dark:border-zinc-800">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-zinc-100" data-sentry-unmask>
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
