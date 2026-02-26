"use client"
import { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { Hexagon } from "@/components/ui/hexagon"

interface WidgetQuickButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    color: "rose" | "amber" | "indigo"
    isActive?: boolean
    loading?: boolean
    hideContentOnLoading?: boolean
}

export function WidgetQuickButton({
    color,
    isActive = false,
    loading = false,
    className,
    children,
    hideContentOnLoading = false,
    ...props
}: WidgetQuickButtonProps) {
    
    const colorClasses = {
        rose: isActive 
            ? "text-rose-500" 
            : "text-rose-100 dark:text-rose-900/50",
        amber: isActive 
            ? "text-amber-500" 
            : "text-amber-100 dark:text-amber-900/50",
        indigo: isActive 
            ? "text-indigo-500" 
            : "text-indigo-100 dark:text-indigo-900/50",
    }

    const iconColorClasses = {
        rose: isActive ? "text-white" : "text-rose-600 dark:text-rose-400",
        amber: isActive ? "text-white" : "text-amber-600 dark:text-amber-400",
        indigo: isActive ? "text-white" : "text-indigo-600 dark:text-indigo-400",
    }

    return (
        <button
            className={cn(
                "group relative flex items-center justify-center transition-transform active:scale-95 disabled:opacity-80",
                className
            )}
            disabled={loading || props.disabled}
            {...props}
        >
            <div className="w-10 h-10 md:w-12 md:h-12">
                <Hexagon
                    color="currentColor"
                    className={cn(
                        "transition-all duration-300",
                        colorClasses[color]
                    )}
                    borderColor={isActive ? "transparent" : "rgba(0,0,0,0.05)"}
                    borderWidth={isActive ? 0 : 1}
                >
                    <div className={cn(
                        "flex items-center justify-center transition-colors duration-300",
                        iconColorClasses[color],
                        loading && hideContentOnLoading && "opacity-0"
                    )}>
                        {children}
                    </div>
                </Hexagon>
                
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-current" />
                    </div>
                )}
            </div>
        </button>
    )
}
