"use client"
import { memo } from "react"
import { areRecordsEqual } from "@/lib/memoUtils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatElapsed } from "@/lib/ageUtils"
import Link from "next/link"
import { ArrowRight, StickyNote, ShieldOff } from "lucide-react"
import { BabyRecord } from "@/hooks/useData"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"
import { isApiError } from "@/lib/api"

interface Props {
  babyId: string
  records?: BabyRecord[]
  isLoading?: boolean
  isError?: unknown
}

export const NoteWidget = memo(function NoteWidget({ babyId, records, isLoading, isError }: Props) {
  const isAccessDenied = isApiError(isError) && isError.status === 403

  if (isAccessDenied) {
    return (
      <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 opacity-60 transition-colors">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-gray-400 dark:text-zinc-500 flex items-center gap-1">
            <StickyNote className="h-4 w-4" />
            メモ
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <ShieldOff className="h-6 w-6 text-gray-300 dark:text-zinc-700 mb-1" />
          <p className="text-[10px] text-gray-400 dark:text-zinc-600">閲覧制限中</p>
        </CardContent>
      </Card>
    )
  }

  const noteRecords = records?.filter(r => r.type === 'note') ?? []
  const lastNote = noteRecords[0]
  const elapsed = lastNote ? formatElapsed(lastNote.timestamp) : null

  return (
    <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
          <StickyNote className="h-4 w-4" />
          メモ
        </CardTitle>
        <Link href={`/note?baby_id=${babyId}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mr-2 text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 dark:text-zinc-600"
            aria-label="メモ一覧"
            title="一覧を見る"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}, (prev, next) => {
    if (prev.isLoading !== next.isLoading) return false
    if (prev.isError !== next.isError) return false
    if (prev.babyId !== next.babyId) return false
    return areRecordsEqual(prev.records, next.records, 'note')
})
