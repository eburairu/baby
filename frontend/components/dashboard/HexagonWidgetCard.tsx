"use client"

import React from "react"
import { Hexagon } from "@/components/ui/hexagon"
import { HexagonProgressArc } from "@/components/ui/HexagonProgressArc"
import { cn } from "@/lib/utils"
import { ShieldOff } from "lucide-react"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"
import { DASHBOARD_UI } from "@/constants/dashboard"
import { isApiError } from "@/lib/api"

interface HexagonWidgetCardProps {
    title?: string
    icon?: React.ReactNode
    children?: React.ReactNode
    isError?: boolean | null | unknown
    isLoading?: boolean
    isSkeleton?: boolean
    className?: string
    size?: number
    indicatorProgress?: number   // undefined = インジケーター非表示
    isOverThreshold?: boolean    // default false
}

/**
 * ハニカム構造（六角形）の中に情報を表示するウィジェットカード
 */
export const HexagonWidgetCard = ({
    title = "",
    icon,
    children,
    isError,
    isLoading,
    isSkeleton,
    className,
    size = DASHBOARD_UI.WIDGET_SIZE.DESKTOP,
    indicatorProgress,
    isOverThreshold = false
}: HexagonWidgetCardProps) => {
    // 403 (Forbidden) のチェック
    const isForbidden = isApiError(isError) && isError.status === 403;

    return (
        <div className={cn(
            "relative transition-all duration-300",
            !isSkeleton && "hover:-translate-y-1",
            className
        )}>
            <Hexagon 
                size={size} 
                className={cn(
                    "text-white dark:text-zinc-900 shadow-sm border-0 transition-colors",
                    isSkeleton && "text-muted/50 animate-pulse shadow-none"
                )}
                borderColor="transparent"
                borderWidth={0}
            >
                <div className="flex flex-col items-center justify-center text-center p-3 h-full w-full overflow-hidden">
                    {isSkeleton ? null : isLoading ? (
                        <div className="flex flex-col items-center gap-2">
                            <BabyBottleLoading className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                            <span className="text-[10px] text-gray-400 dark:text-zinc-500">読み込み中...</span>
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center gap-1">
                            <ShieldOff className="h-5 w-5 text-rose-400 dark:text-rose-500 mb-1" />
                            <span className="text-[10px] text-rose-500 dark:text-rose-400 leading-tight">
                                {isForbidden ? "閲覧制限中" : "エラーが発生しました"}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center w-full space-y-1.5">
                            {icon && <div className="text-indigo-500 dark:text-indigo-400">{icon}</div>}
                            <h3 className="text-[11px] font-bold text-gray-700 dark:text-zinc-300 line-clamp-1 w-full" data-sentry-unmask>
                                {title}
                            </h3>
                            <div className="text-[10px] text-gray-500 dark:text-zinc-400 w-full" data-sentry-unmask>
                                {children}
                            </div>
                        </div>
                    )}
                </div>
            </Hexagon>
            {indicatorProgress !== undefined && indicatorProgress > 0 && !isSkeleton && !isLoading && !isError && (
                <HexagonProgressArc
                    size={size}
                    progress={indicatorProgress}
                    isOverThreshold={isOverThreshold}
                />
            )}
        </div>
    )
}
