import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { STATS_BLOCK_CONFIG } from "@/constants/ui-colors"
import { Hexagon } from "@/components/ui/hexagon"

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
      <Hexagon
        size={32}
        cornerRadius={4}
        className="text-white dark:text-zinc-800 shadow-sm shrink-0 mt-0.5"
      >
        <Icon className={cn("h-4 w-4", styles.icon)} />
      </Hexagon>
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
