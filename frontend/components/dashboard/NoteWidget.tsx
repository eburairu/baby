"use client"

import { memo } from "react"
import { createWidgetMemoComparison } from "@/lib/memoUtils"
import { formatElapsed } from "@/lib/ageUtils"
import { AppIcons } from "@/constants/icons"
import { HexagonWidgetCard } from "./HexagonWidgetCard"
import { BaseWidgetProps } from "@/types/widget"
import Link from "next/link"

export const NoteWidget = memo(function NoteWidget({ babyId, records, isLoading, isError, size }: BaseWidgetProps) {
  const noteRecords = records?.filter(r => r.type === 'note') ?? []
  const lastNote = noteRecords[0]
  const elapsed = lastNote ? formatElapsed(lastNote.timestamp) : null

  return (
    <Link href={`/note?baby_id=${babyId}`} className="block">
      <HexagonWidgetCard
        title="メモ"
        icon={<AppIcons.note className="w-5 h-5 text-blue-500" />}
        isError={isError}
        isLoading={isLoading} 
        size={size}
        className="hover:shadow-blue-100 dark:hover:shadow-blue-900/20"
      >
        <div className="flex flex-col items-center">
          {lastNote ? (
            <>
              <span className="font-bold text-gray-800 dark:text-zinc-200 line-clamp-1 w-full px-1">
                {lastNote.details.notes as string}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-zinc-500 mt-0.5">{elapsed}</span>
            </>
          ) : (
            <span className="text-[10px] text-gray-500 dark:text-zinc-600">記録なし</span>
          )}
        </div>
      </HexagonWidgetCard>
    </Link>
  )
}, createWidgetMemoComparison('note'))
