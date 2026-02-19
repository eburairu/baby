"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible"
import type { TipsItem } from "@/lib/tips-data"

const colorConfig = {
  rose: {
    border: "border-rose-200 dark:border-rose-800",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    accent: "bg-rose-400",
    icon: "text-rose-500",
    title: "text-rose-700 dark:text-rose-300",
    item: "text-rose-800 dark:text-rose-200",
    trigger: "hover:bg-rose-100/50 dark:hover:bg-rose-900/20",
  },
  indigo: {
    border: "border-indigo-200 dark:border-indigo-800",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    accent: "bg-indigo-400",
    icon: "text-indigo-500",
    title: "text-indigo-700 dark:text-indigo-300",
    item: "text-indigo-800 dark:text-indigo-200",
    trigger: "hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20",
  },
  amber: {
    border: "border-amber-200 dark:border-amber-800",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    accent: "bg-amber-400",
    icon: "text-amber-500",
    title: "text-amber-700 dark:text-amber-300",
    item: "text-amber-800 dark:text-amber-200",
    trigger: "hover:bg-amber-100/50 dark:hover:bg-amber-900/20",
  },
  emerald: {
    border: "border-emerald-200 dark:border-emerald-800",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    accent: "bg-emerald-400",
    icon: "text-emerald-500",
    title: "text-emerald-700 dark:text-emerald-300",
    item: "text-emerald-800 dark:text-emerald-200",
    trigger: "hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20",
  },
  red: {
    border: "border-red-200 dark:border-red-800",
    bg: "bg-red-50 dark:bg-red-950/30",
    accent: "bg-red-400",
    icon: "text-red-500",
    title: "text-red-700 dark:text-red-300",
    item: "text-red-800 dark:text-red-200",
    trigger: "hover:bg-red-100/50 dark:hover:bg-red-900/20",
  },
  purple: {
    border: "border-purple-200 dark:border-purple-800",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    accent: "bg-purple-400",
    icon: "text-purple-500",
    title: "text-purple-700 dark:text-purple-300",
    item: "text-purple-800 dark:text-purple-200",
    trigger: "hover:bg-purple-100/50 dark:hover:bg-purple-900/20",
  },
  slate: {
    border: "border-slate-200 dark:border-slate-700",
    bg: "bg-slate-50 dark:bg-slate-900/30",
    accent: "bg-slate-400",
    icon: "text-slate-500",
    title: "text-slate-700 dark:text-slate-300",
    item: "text-slate-700 dark:text-slate-300",
    trigger: "hover:bg-slate-100/50 dark:hover:bg-slate-800/20",
  },
} as const

interface TipsCardProps {
  storageKey: string
  color: keyof typeof colorConfig
  tips: TipsItem[]
}

export function TipsCard({ storageKey, color, tips }: TipsCardProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const c = colorConfig[color]

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    const timer = setTimeout(() => {
      setIsOpen(saved !== "closed")
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [storageKey])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      localStorage.removeItem(storageKey)
    } else {
      localStorage.setItem(storageKey, "closed")
    }
  }

  if (!mounted) return null

  return (
    <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
      <div className={cn("rounded-xl border overflow-hidden", c.border, c.bg)}>
        <CollapsibleTrigger className={cn(
          "w-full flex items-center justify-between px-4 py-3 transition-colors",
          c.trigger
        )}>
          <div className="flex items-center gap-2">
            <Lightbulb className={cn("size-4 shrink-0", c.icon)} />
            <span className={cn("text-sm font-medium", c.title)}>
              Tips
            </span>
          </div>
          {isOpen ? (
            <ChevronUp className={cn("size-4", c.icon)} />
          ) : (
            <ChevronDown className={cn("size-4", c.icon)} />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-1 space-y-3">
            {tips.map((tip, i) => (
              <div key={i}>
                <p className={cn("text-xs font-semibold mb-1", c.title)}>
                  {tip.title}
                </p>
                <ul className="space-y-0.5">
                  {tip.items.map((item, j) => (
                    <li key={j} className={cn("text-xs flex gap-1.5", c.item)}>
                      <span className="shrink-0 mt-0.5">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
