"use client"

import { ReactNode } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/useIsMobile"

interface ResponsiveModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: ReactNode
    children: ReactNode
    onOpenAutoFocus?: (e: Event) => void
    contentClassName?: string
    dialogClassName?: string
}

/**
 * モバイルでは Drawer（ボトムシート）、デスクトップでは Dialog（センターモーダル）を使う
 * レスポンシブモーダルコンポーネント
 */
export function ResponsiveModal({
    open,
    onOpenChange,
    title,
    children,
    onOpenAutoFocus,
    contentClassName,
    dialogClassName,
}: ResponsiveModalProps) {
    const isMobile = useIsMobile()

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className={`max-h-[92dvh] dark:bg-zinc-900 ${dialogClassName || ''}`}>
                    <DrawerHeader className="border-b bg-slate-50 dark:bg-zinc-900/50 px-4 py-3 text-left">
                        <DrawerTitle className="text-base font-bold flex items-center gap-2" data-sentry-unmask>
                            {title}
                        </DrawerTitle>
                    </DrawerHeader>
                    <div className={`p-4 overflow-y-auto ${contentClassName || ''}`}>
                        {children}
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={`max-w-md p-0 overflow-hidden border-0 sm:border rounded-2xl dark:bg-zinc-900 dark:border-zinc-800 ${dialogClassName || ''}`}
                onOpenAutoFocus={onOpenAutoFocus}
            >
                <DialogHeader className="p-4 border-b bg-slate-50 dark:bg-zinc-900/50">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2" data-sentry-unmask>
                        {title}
                    </DialogTitle>
                </DialogHeader>
                <div className={`p-4 max-h-[80vh] overflow-y-auto ${contentClassName || ''}`}>
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    )
}
