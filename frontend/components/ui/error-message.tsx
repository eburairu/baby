"use client"

import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function ErrorMessage({ message, className }: { message: string, className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/50 transition-colors", className)}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}
