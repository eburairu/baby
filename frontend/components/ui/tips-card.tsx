"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible"
import type { TipsItem } from "@/lib/tips-data"
import { TIPS_CARD_CONFIG } from "@/constants/ui-colors"

interface TipsCardProps {
  storageKey: string
  color: keyof typeof TIPS_CARD_CONFIG
  tips: TipsItem[]
}

export function TipsCard({ storageKey, color, tips }: TipsCardProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  // 色設定を取得
  const c = TIPS_CARD_CONFIG[color]

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
      <div className={cn("rounded-xl border overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-background", c.border, c.bg)}>
        <CollapsibleTrigger className={cn(
          "w-full flex items-center justify-between px-4 py-3 transition-colors focus:outline-none",
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
