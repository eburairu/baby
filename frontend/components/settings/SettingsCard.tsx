import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SettingsCardProps {
  children: ReactNode
  className?: string
}

export function SettingsCard({ children, className }: SettingsCardProps) {
  return (
    <div className={cn("bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-4 transition-colors", className)}>
      {children}
    </div>
  )
}
