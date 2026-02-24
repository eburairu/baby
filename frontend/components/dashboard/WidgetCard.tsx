import { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, ShieldOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { isApiError } from "@/lib/api"
import { cn } from "@/lib/utils"

interface WidgetCardProps {
    title: ReactNode
    href: string
    isError?: unknown
    children: ReactNode
    headerAction?: ReactNode
    actionHoverColor?: string
    ariaLabel?: string
}

export function WidgetCard({
    title,
    href,
    isError,
    children,
    headerAction,
    actionHoverColor = "hover:text-indigo-500 dark:hover:text-indigo-400",
    ariaLabel
}: WidgetCardProps) {
    const isAccessDenied = isApiError(isError) && isError.status === 403
    const label = ariaLabel || "詳細を見る"

    if (isAccessDenied) {
        return (
            <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 opacity-60 transition-colors">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-400 dark:text-zinc-500 flex items-center gap-1" data-sentry-unmask>
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                    <ShieldOff className="h-6 w-6 text-gray-300 dark:text-zinc-700 mb-1" />
                    <p className="text-[10px] text-gray-400 dark:text-zinc-600" data-sentry-unmask>閲覧制限中</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium flex items-center gap-1" data-sentry-unmask>
                    {title}
                </CardTitle>
                <div className="flex items-center gap-1">
                    {headerAction}
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-6 w-6 -mr-2 text-gray-400 dark:text-zinc-600 transition-colors",
                            actionHoverColor
                        )}
                        asChild
                    >
                        <Link href={href} aria-label={label} title={label}>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {children}
            </CardContent>
        </Card>
    )
}
