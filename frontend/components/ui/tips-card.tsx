"use client"

import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible"
import type { TipsItem } from "@/lib/tips-data"
import { TIPS_CARD_CONFIG } from "@/constants/ui-colors"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useMounted } from "@/hooks/useMounted"

interface TipsCardProps {
  storageKey: string
  color: keyof typeof TIPS_CARD_CONFIG
  tips: TipsItem[]
}

export function TipsCard({ storageKey, color, tips }: TipsCardProps) {
  const [savedState, setSavedState] = useLocalStorage<"open" | "closed">(storageKey, "open")

  const mounted = useMounted(0, true)

  // 色設定を取得
  const c = TIPS_CARD_CONFIG[color]

  const handleOpenChange = (open: boolean) => {
    setSavedState(open ? "open" : "closed")
  }

  if (!mounted) return null

  const isOpen = savedState !== "closed"

  return (
    <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
      <div className={cn("rounded-xl border overflow-hidden", c.border, c.bg)}>
        <CollapsibleTrigger className={cn(
          "w-full flex items-center justify-between px-4 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
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
