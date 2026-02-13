"use client"

import { Loader2 } from "lucide-react"

export function PageLoading({ message = "読み込み中..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">{message}</p>
        </div>
    )
}
