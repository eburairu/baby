"use client"

import { ReactNode } from "react"
import { ResponsiveModal } from "@/components/ui/responsive-modal"

interface EditDialogBaseProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: ReactNode
    children: ReactNode
    onOpenAutoFocus?: (e: Event) => void
    contentClassName?: string
    dialogClassName?: string
}

export function EditDialogBase({ open, onOpenChange, title, children, onOpenAutoFocus, contentClassName, dialogClassName }: EditDialogBaseProps) {
    return (
        <ResponsiveModal
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            onOpenAutoFocus={onOpenAutoFocus}
            contentClassName={contentClassName}
            dialogClassName={dialogClassName}
        >
            {children}
        </ResponsiveModal>
    )
}
