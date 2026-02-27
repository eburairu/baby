"use client"

import React from "react"
import { Hexagon } from "@/components/ui/hexagon"
import { cn } from "@/lib/utils"
import { ShieldOff, Loader2 } from "lucide-react"

interface ErrorWithStatus {
    status?: number;
}

interface HexagonWidgetCardProps {
    title: string
    icon?: React.ReactNode
    children?: React.ReactNode
    isError?: boolean | ErrorWithStatus | null
    isLoading?: boolean
    className?: string
    size?: number
}

/**
 * ハニカム構造（六角形）の中に情報を表示するウィジェットカード
 */
export const HexagonWidgetCard = ({
    title,
    icon,
    children,
    isError,
    isLoading,
    className,
    size = 160
}: HexagonWidgetCardProps) => {
    // 403 (Forbidden) のチェック
    const isForbidden = isError && typeof isError === 'object' && 'status' in isError && (isError as ErrorWithStatus).status === 403;

    return (
        <div className={cn("relative transition-all duration-300 hover:-translate-y-1", className)}>
            <Hexagon 
                size={size} 
                className="bg-white dark:bg-zinc-900 shadow-sm border-0 transition-colors"
                cornerRadius={12}
                color="white"
                borderColor="transparent"
                borderWidth={0}
            >
                <div className="flex flex-col items-center justify-center text-center p-3 h-full w-full overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                            <span className="text-[10px] text-gray-400">読み込み中...</span>
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center gap-1">
                            <ShieldOff className="h-5 w-5 text-rose-400 mb-1" />
                            <span className="text-[10px] text-rose-500 leading-tight">
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
        </div>
    )
}
