"use client"

import { AlertCircle } from "lucide-react"

export function ErrorMessage({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg my-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{message}</span>
        </div>
    )
}
