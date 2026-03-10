import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface RecordListItemProps {
    /** The icon to display on the left side */
    icon?: ReactNode
    /** The main content (title, timestamp, details, etc.) */
    children: ReactNode
    /** Action buttons to display on the right side */
    actions?: ReactNode
    /** Additional class names for the container */
    className?: string
    /** Click handler for the entire item */
    onClick?: () => void
}

export function RecordListItem({
    icon,
    children,
    actions,
    className,
    onClick
}: RecordListItemProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-between p-3 rounded-xl border transition-colors",
                "bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800",
                "hover:bg-slate-50 dark:hover:bg-zinc-800",
                className
            )}
            onClick={onClick}
        >
            <div className="flex items-start gap-4 w-full overflow-hidden">
                {icon && (
                    <div className="shrink-0 mt-1">
                        {icon}
                    </div>
                )}
                <div className="space-y-1 min-w-0 flex-1">
                    {children}
                </div>
            </div>
            {actions && (
                <div className="flex items-center gap-1 shrink-0 ml-4">
                    {actions}
                </div>
            )}
        </div>
    )
}
