"use client"

import { ReactNode } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export interface ConfirmAlertDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: ReactNode
    description?: ReactNode
    cancelText?: string
    confirmText?: string
    onConfirm: () => void
    confirmButtonClass?: string
    loading?: boolean
    cancelButtonProps?: React.ComponentProps<typeof AlertDialogCancel>
    confirmButtonProps?: React.ComponentProps<typeof AlertDialogAction>
}

export function ConfirmAlertDialog({
    open,
    onOpenChange,
    title,
    description,
    cancelText = "キャンセル",
    confirmText = "確認",
    onConfirm,
    confirmButtonClass,
    loading = false,
    cancelButtonProps,
    confirmButtonProps,
}: ConfirmAlertDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description && (
                        <AlertDialogDescription asChild>
                            <div>{description}</div>
                        </AlertDialogDescription>
                    )}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading} {...cancelButtonProps}>
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={confirmButtonClass}
                        loading={loading}
                        {...confirmButtonProps}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
