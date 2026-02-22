import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { STATS_BLOCK_CONFIG } from "@/constants/ui-colors"

export type StatsBlockColor = keyof typeof STATS_BLOCK_CONFIG

interface StatsBlockProps {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  children?: React.ReactNode
  color?: StatsBlockColor
  className?: string
}

export function StatsBlock({
  icon: Icon,
  label,
  value,
  children,
  color = "zinc",
  className,
}: StatsBlockProps) {
  const styles = STATS_BLOCK_CONFIG[color]

  return (
    <div
      className={cn(
        "rounded-xl p-4 flex items-start gap-3 transition-colors",
        styles.bg,
        className
      )}
    >
      <div className="bg-white dark:bg-zinc-800 rounded-full p-2 shadow-sm transition-colors shrink-0 mt-0.5">
        <Icon className={cn("h-4 w-4", styles.icon)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 dark:text-zinc-400">{label}</p>
        <p className="text-lg font-bold text-gray-800 dark:text-zinc-100 truncate">
          {value}
        </p>
        {children}
      </div>
    </div>
  )
}
