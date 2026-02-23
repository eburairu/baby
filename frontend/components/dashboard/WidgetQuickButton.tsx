"use client"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// カラーマップ定義
// Tailwindのクラスを完全に記述して、Purgeされないようにする
const colorStyles = {
    rose: {
        default: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50",
        active: "bg-rose-500 dark:bg-rose-600 text-white hover:bg-rose-600 dark:hover:bg-rose-700",
    },
    amber: {
        default: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50",
        active: "bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-700",
    },
    indigo: {
        default: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50",
        active: "bg-indigo-500 dark:bg-indigo-600 text-white hover:bg-indigo-600 dark:hover:bg-indigo-700",
    },
} as const

type WidgetColor = keyof typeof colorStyles

interface WidgetQuickButtonProps extends ButtonProps {
    color: WidgetColor
    isActive?: boolean
}

export function WidgetQuickButton({
    color,
    isActive = false,
    className,
    children,
    variant = "outline",
    size = "sm",
    ...props
}: WidgetQuickButtonProps) {
    const styles = colorStyles[color]
    const colorClass = isActive ? styles.active : styles.default

    return (
        <Button
            variant={variant}
            size={size}
            className={cn(
                "border-0 text-xs h-8 transition-colors",
                colorClass,
                className
            )}
            data-sentry-unmask
            {...props}
        >
            {children}
        </Button>
    )
}
