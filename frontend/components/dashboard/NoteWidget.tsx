"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNotes } from "@/hooks/useNotes"
import { formatElapsed } from "@/lib/ageUtils"
import Link from "next/link"
import { ArrowRight, StickyNote } from "lucide-react"

interface Props {
  babyId: string
}

export function NoteWidget({ babyId }: Props) {
  const { notes, isLoading } = useNotes(Number(babyId))

  const lastNote = notes?.[0]
  const elapsed = lastNote ? formatElapsed(lastNote.note_time) : null

  return (
    <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 transition-colors">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-500 flex items-center gap-1">
          <StickyNote className="h-4 w-4" />
          メモ
        </CardTitle>
        <Link href={`/note?baby_id=${babyId}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mr-2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 dark:text-zinc-600"
            aria-label="メモ一覧"
            title="一覧を見る"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-xs text-gray-400 animate-pulse">読み込み中...</p>
        ) : lastNote ? (
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-zinc-400">{elapsed}</p>
            <p className="text-sm text-gray-800 dark:text-zinc-200 line-clamp-2 font-medium leading-relaxed">
              {lastNote.content}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-zinc-600 py-2">記録なし</p>
        )}
      </CardContent>
    </Card>
  )
}
