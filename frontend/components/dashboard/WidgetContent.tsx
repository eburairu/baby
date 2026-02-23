import { ReactNode } from "react"
import { WidgetLoading } from "./WidgetLoading"
import { cn } from "@/lib/utils"

interface WidgetContentProps {
    isLoading?: boolean
    loadingColorClass?: string
    elapsed: string | null
    emptyContent?: ReactNode
    emptyContentClassName?: string
    subContent?: ReactNode
    children?: ReactNode
}

export function WidgetContent({
    isLoading,
    loadingColorClass,
    elapsed,
    emptyContent = "記録なし",
    emptyContentClassName,
    subContent,
    children
}: WidgetContentProps) {
    if (isLoading) {
        return <WidgetLoading className={loadingColorClass} />
    }

    return (
        <div>
            {children}
            {elapsed ? (
                <p className="text-2xl font-bold text-gray-800 dark:text-zinc-100">{elapsed}</p>
            ) : (
                <div className={cn("text-sm text-gray-400 dark:text-zinc-600", emptyContentClassName)} data-sentry-unmask>
                    {emptyContent}
                </div>
            )}
            {subContent && (
                <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                    {subContent}
                </div>
            )}
        </div>
    )
}
