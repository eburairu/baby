"use client"

import { AlertCircle } from "lucide-react"

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/50 transition-colors">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}
