"use client"

import * as React from "react"
import { Hexagon, HEX_CONSTANTS } from "./hexagon"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface HexagonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  label?: string
  loading?: boolean
  active?: boolean
  size?: number            // この size は正六角形の「高さ (直径)」に相当する
  pointy?: boolean
  variant?: "primary" | "rose" | "amber" | "indigo" | "emerald" | "zinc"
}

export function HexagonButton({
  icon,
  label,
  loading = false,
  active = false,
  size = 64,
  pointy = true,
  variant = "primary",
  className,
  children,
  ...props
}: HexagonButtonProps) {
  // Theme configuration
  const themes = {
    primary: {
      bg: active ? "text-primary" : "text-white dark:text-zinc-800",
      icon: active ? "text-white" : "text-primary group-hover:text-primary/80",
      border: active ? "var(--color-primary)" : "rgba(0,0,0,0.05)",
      glow: "bg-primary/20"
    },
    rose: {
      bg: active ? "text-rose-500" : "text-rose-100 dark:text-rose-950/40",
      icon: active ? "text-white" : "text-rose-600 dark:text-rose-400",
      border: active ? "var(--color-rose-500)" : "rgba(0,0,0,0.05)",
      glow: "bg-rose-500/20"
    },
    amber: {
      bg: active ? "text-amber-500" : "text-amber-100 dark:text-amber-950/40",
      icon: active ? "text-white" : "text-amber-600 dark:text-amber-400",
      border: active ? "var(--color-amber-500)" : "rgba(0,0,0,0.05)",
      glow: "bg-amber-500/20"
    },
    indigo: {
      bg: active ? "text-indigo-500" : "text-indigo-100 dark:text-indigo-950/40",
      icon: active ? "text-white" : "text-indigo-600 dark:text-indigo-400",
      border: active ? "var(--color-indigo-500)" : "rgba(0,0,0,0.05)",
      glow: "bg-indigo-500/20"
    },
    emerald: {
      bg: active ? "text-emerald-500" : "text-emerald-100 dark:text-emerald-950/40",
      icon: active ? "text-white" : "text-emerald-600 dark:text-emerald-400",
      border: active ? "var(--color-emerald-500)" : "rgba(0,0,0,0.05)",
      glow: "bg-emerald-500/20"
    },
    zinc: {
      bg: active ? "text-zinc-500" : "text-zinc-100 dark:text-zinc-900/50",
      icon: active ? "text-white" : "text-zinc-600 dark:text-zinc-400",
      border: active ? "var(--color-zinc-500)" : "rgba(0,0,0,0.05)",
      glow: "bg-zinc-500/20"
    }
  }

  const theme = themes[variant]

  // Pointy-topped 六角形の場合、横幅は size * 0.866
  const width = pointy ? size * HEX_CONSTANTS.POINTY_W_TO_H : size;
  const height = pointy ? size : size * HEX_CONSTANTS.FLAT_H_TO_W;

  return (
    <button
      className={cn(
        "group relative flex flex-col items-center justify-center transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      disabled={loading}
      aria-busy={loading}
      aria-pressed={active}
      {...props}
      style={{ width, height, ...props.style }}
    >
      <div className="relative w-full h-full">
        <Hexagon
          size={size}
          pointy={pointy}
          color="currentColor"
          className={cn(
            "transition-all duration-300 w-full h-full",
            theme.bg,
            !active && "hover:opacity-90"
          )}
          borderColor={theme.border}
          borderWidth={active ? 3 : 1}
        >
          <div className={cn(
            "flex items-center justify-center transition-colors duration-300",
            theme.icon
          )}>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              icon || children
            )}
          </div>
        </Hexagon>
        
        {active && (
          <div className={cn("absolute inset-0 blur-xl -z-10 animate-pulse", theme.glow)} />
        )}
      </div>
      
      {label && (
        <span className="absolute -bottom-5 text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-tighter whitespace-nowrap">
          {label}
        </span>
      )}
    </button>
  )
}
