"use client"

import * as React from "react"
import { Hexagon } from "./hexagon"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface HexagonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  label?: string
  loading?: boolean
  active?: boolean
  size?: number | string
}

export function HexagonButton({
  icon,
  label,
  loading = false,
  active = false,
  size = 64,
  className,
  ...props
}: HexagonButtonProps) {
  return (
    <button
      className={cn(
        "group relative flex flex-col items-center justify-center transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      disabled={loading}
      {...props}
    >
      <div className="relative" style={{ width: size }}>
        <Hexagon
          color="currentColor"
          className={cn(
            "text-white dark:text-zinc-900 transition-all duration-300",
            active ? "text-primary dark:text-primary" : "text-white dark:text-zinc-800",
            !active && "hover:text-gray-50 dark:hover:text-zinc-700"
          )}
          borderColor={active ? "var(--primary)" : "rgba(0,0,0,0.05)"}
          borderWidth={active ? 4 : 1}
        >
          <div className={cn(
            "flex items-center justify-center transition-colors duration-300",
            active ? "text-white" : "text-primary group-hover:text-primary/80"
          )}>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              icon
            )}
          </div>
        </Hexagon>
        
        {active && (
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl -z-10 animate-pulse" />
        )}
      </div>
      
      {label && (
        <span className="mt-1 text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-tighter">
          {label}
        </span>
      )}
    </button>
  )
}
