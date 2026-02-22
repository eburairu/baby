"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, ShieldOff } from "lucide-react"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"
import { cn } from "@/lib/utils"

interface WidgetCardProps {
    title: React.ReactNode
    href?: string
    isAccessDenied?: boolean
    isLoading?: boolean
    loadingColorClass?: string
    children?: React.ReactNode
    className?: string
    action?: React.ReactNode
    titleClassName?: string
    actionButtonClassName?: string
}

export function WidgetCard({
    title,
    href,
    isAccessDenied,
    isLoading,
    loadingColorClass,
    children,
    className,
    action,
    titleClassName,
    actionButtonClassName,
}: WidgetCardProps) {
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
        <Card className={cn("dark:bg-zinc-900 rounded-2xl shadow-sm border-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-md", className)}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className={cn("text-sm font-medium flex items-center gap-1", titleClassName)} data-sentry-unmask>
                    {title}
                </CardTitle>
                {action ? action : href && (
                    <Link href={href}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-6 w-6 -mr-2 text-gray-400 dark:text-zinc-600", actionButtonClassName)}
                            aria-label="詳細"
                            title="詳細を見る"
                        >
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                )}
            </CardHeader>
            <CardContent className="space-y-3">
                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <BabyBottleLoading className={cn("w-8 h-8", loadingColorClass)} />
                    </div>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    )
}
