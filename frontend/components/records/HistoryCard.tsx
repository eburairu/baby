"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"

interface HistoryCardProps {
    title?: string
    isEmpty: boolean
    emptyMessage?: string
    children?: ReactNode
}

export function HistoryCard({
    title = "最近の記録",
    isEmpty,
    emptyMessage = "記録がありません",
    children
}: HistoryCardProps) {
    if (isEmpty) {
        return (
            <Card className="rounded-2xl shadow-sm border-0">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm text-center py-4">{emptyMessage}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="rounded-2xl shadow-sm border-0 transition-colors">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {children}
            </CardContent>
        </Card>
    )
}
