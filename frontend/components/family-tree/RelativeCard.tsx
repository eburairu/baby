"use client"
import { UserCircle2, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Relative } from "@/types/relative"
import type { RelationshipType } from "@/types/relative"
import { RELATIONSHIP_LABELS } from "@/lib/relativeUtils"

interface RelativeCardProps {
  relative: Relative | null
  relationshipType: RelationshipType
  canWrite: boolean
  onClick: () => void
}

export function RelativeCard({
  relative,
  relationshipType,
  canWrite,
  onClick,
}: RelativeCardProps) {
  const label = RELATIONSHIP_LABELS[relationshipType]

  if (!relative) {
    if (!canWrite) return null
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-1 p-2 rounded-lg border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-accent/50 transition-colors min-w-[64px] text-muted-foreground/60 hover:text-muted-foreground"
        aria-label={`${label}を追加`}
        title={`${label}を追加`}
      >
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">+</div>
        <span className="text-[10px] leading-tight">{label}</span>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors min-w-[64px]",
        "border-border hover:border-primary/50"
      )}
      aria-label={`${relative.name}（${label}）の詳細・編集`}
      title={`${relative.name}（${label}）の詳細・編集`}
    >
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <UserCircle2 className="w-5 h-5 text-primary/70" />
        </div>
        {relative.user_id && (
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
            <Link2 className="w-2 h-2 text-white" />
          </div>
        )}
      </div>
      <span className="text-[11px] font-medium leading-tight text-center max-w-[72px] truncate">{relative.name}</span>
      <span className="text-[9px] text-muted-foreground leading-tight">{label}</span>
    </button>
  )
}
