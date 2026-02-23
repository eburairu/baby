"use client"
import { memo } from "react"
import { areRecordsEqual } from "@/lib/memoUtils"
import { formatElapsed } from "@/lib/ageUtils"
import { StickyNote } from "lucide-react"
import { BabyRecord } from "@/types/record"
import { WidgetCard } from "./WidgetCard"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"

interface Props {
  babyId: string
  records?: BabyRecord[]
  isLoading?: boolean
  isError?: unknown
}

export const NoteWidget = memo(function NoteWidget({ babyId, records, isLoading, isError }: Props) {
  const noteRecords = records?.filter(r => r.type === 'note') ?? []
  const lastNote = noteRecords[0]
  const elapsed = lastNote ? formatElapsed(lastNote.timestamp) : null

  return (
    <WidgetCard
      title={
        <span className="text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
          <StickyNote className="h-4 w-4" />
          メモ
        </span>
      }
      href={`/note?baby_id=${babyId}`}
      isError={isError}
      actionHoverColor="hover:text-amber-500 dark:hover:text-amber-400"
      ariaLabel="メモの詳細を見る"
    >
      {isLoading ? (
        <div className="flex justify-center py-4">
          <BabyBottleLoading className="w-8 h-8 text-amber-400" />
        </div>
      ) : lastNote ? (
        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">{elapsed}</p>
          <p className="text-sm text-gray-700 dark:text-zinc-300 line-clamp-3 leading-relaxed font-medium">
            {lastNote.details.notes as string}
          </p>
        </div>
      ) : (
        <div className="py-4">
          <p className="text-sm text-gray-400 dark:text-zinc-600">記録なし</p>
        </div>
      )}
    </WidgetCard>
  )
}, (prev, next) => {
    if (prev.isLoading !== next.isLoading) return false
    if (prev.isError !== next.isError) return false
    if (prev.babyId !== next.babyId) return false
    return areRecordsEqual(prev.records, next.records, 'note')
})
