"use client"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

const widgetQuickButtonVariants = cva(
    "border-0 text-xs h-8 transition-colors",
    {
        variants: {
            color: {
                rose: "",
                amber: "",
                indigo: "",
            },
            isActive: {
                true: "",
                false: "",
            },
        },
        compoundVariants: [
            {
                color: "rose",
                isActive: false,
                class: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50",
            },
            {
                color: "rose",
                isActive: true,
                class: "bg-rose-500 dark:bg-rose-600 text-white hover:bg-rose-600 dark:hover:bg-rose-700",
            },
            {
                color: "amber",
                isActive: false,
                class: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50",
            },
            {
                color: "amber",
                isActive: true,
                class: "bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-700",
            },
            {
                color: "indigo",
                isActive: false,
                class: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50",
            },
            {
                color: "indigo",
                isActive: true,
                class: "bg-indigo-500 dark:bg-indigo-600 text-white hover:bg-indigo-600 dark:hover:bg-indigo-700",
            },
        ],
        defaultVariants: {
            isActive: false,
        },
    }
)

interface WidgetQuickButtonProps extends ButtonProps, VariantProps<typeof widgetQuickButtonVariants> {
    color: "rose" | "amber" | "indigo"
    hideContentOnLoading?: boolean
}

export function WidgetQuickButton({
    color,
    isActive = false,
    className,
    children,
    variant = "outline",
    size = "sm",
    hideContentOnLoading = false,
    ...props
}: WidgetQuickButtonProps) {
    const loading = props.loading

    if (loading && hideContentOnLoading) {
        return (
            <Button
                variant={variant}
                size={size}
                className={cn(
                    widgetQuickButtonVariants({ color, isActive, className }),
                    "relative"
                )}
                aria-busy={true}
                data-sentry-unmask
                {...props}
                disabled={true}
                loading={false}
            >
                <span className="opacity-0 flex items-center justify-center gap-2 w-full h-full pointer-events-none select-none">
                    {children}
                </span>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                </div>
            </Button>
        )
    }

    return (
        <Button
            variant={variant}
            size={size}
            className={cn(
                widgetQuickButtonVariants({ color, isActive, className })
            )}
            aria-busy={loading}
            data-sentry-unmask
            {...props}
        >
            {children}
        </Button>
    )
}
