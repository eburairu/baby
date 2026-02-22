"use client"
import { memo } from "react"
import { areRecordsEqual } from "@/lib/memoUtils"
import { formatElapsed } from "@/lib/ageUtils"
import { StickyNote } from "lucide-react"
import { BabyRecord } from "@/hooks/useData"
import { WidgetCard } from "./WidgetCard"

interface Props {
  babyId: string
  records?: BabyRecord[]
  isLoading?: boolean
}

export const NoteWidget = memo(function NoteWidget({ babyId, records, isLoading }: Props) {
  const noteRecords = records?.filter(r => r.type === 'note') ?? []
  const lastNote = noteRecords[0]
  const elapsed = lastNote ? formatElapsed(lastNote.timestamp) : null

  const title = (
    <>
      <StickyNote className="h-4 w-4" />
      メモ
    </>
  )

  return (
    <WidgetCard
        title={title}
        titleClassName="text-amber-600 dark:text-amber-500"
        href={`/note?baby_id=${babyId}`}
        isLoading={isLoading}
        loadingColorClass="text-amber-400"
        actionButtonClassName="hover:text-amber-600 dark:hover:text-amber-500"
    >
        {lastNote ? (
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-zinc-400">{elapsed}</p>
            <p className="text-sm text-gray-800 dark:text-zinc-200 line-clamp-2 font-medium leading-relaxed">
              {lastNote.details.notes as string}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-zinc-600 py-2">記録なし</p>
        )}
    </WidgetCard>
  )
}, (prev, next) => {
    if (prev.isLoading !== next.isLoading) return false
    if (prev.babyId !== next.babyId) return false
    return areRecordsEqual(prev.records, next.records, 'note')
})
