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
}

export function HexagonButton({
  icon,
  label,
  loading = false,
  active = false,
  size = 64,
  pointy = true,
  className,
  ...props
}: HexagonButtonProps) {
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
      {...props}
      style={{ width, height }}
    >
      <div className="relative w-full h-full">
        <Hexagon
          size={size}
          pointy={pointy}
          color="currentColor"
          className={cn(
            "text-white dark:text-zinc-900 transition-all duration-300 w-full h-full",
            active ? "text-primary dark:text-primary" : "text-white dark:text-zinc-800",
            !active && "hover:text-gray-50 dark:hover:text-zinc-700"
          )}
          borderColor={active ? "var(--primary)" : "rgba(0,0,0,0.05)"}
          borderWidth={active ? 3 : 1}
        >
          <div className={cn(
            "flex items-center justify-center transition-colors duration-300",
            active ? "text-white" : "text-primary group-hover:text-primary/80"
          )}>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              icon
            )}
          </div>
        </Hexagon>
        
        {active && (
          <div className="absolute inset-0 bg-primary/20 blur-xl -z-10 animate-pulse" />
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
