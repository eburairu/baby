import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export type StatsBlockColor = "rose" | "indigo" | "amber" | "emerald" | "blue" | "zinc"

interface StatsBlockProps {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  children?: React.ReactNode
  color?: StatsBlockColor
  className?: string
}

const colorStyles: Record<StatsBlockColor, { bg: string; icon: string }> = {
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    icon: "text-rose-500 dark:text-rose-400",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    icon: "text-indigo-500 dark:text-indigo-400",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    icon: "text-amber-500 dark:text-amber-400",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    icon: "text-emerald-500 dark:text-emerald-400",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    icon: "text-blue-500 dark:text-blue-400",
  },
  zinc: {
    bg: "bg-zinc-50 dark:bg-zinc-900/50",
    icon: "text-zinc-500 dark:text-zinc-400",
  },
}

export function StatsBlock({
  icon: Icon,
  label,
  value,
  children,
  color = "zinc",
  className,
}: StatsBlockProps) {
  const styles = colorStyles[color]

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
