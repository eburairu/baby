"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { createNote } from "@/hooks/useNotes"
import { useRecords } from "@/hooks/useData"
import { isApiError } from "@/lib/api"

interface Props {
  babyId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NoteDialog({ babyId, open, onOpenChange }: Props) {
  const [content, setContent] = useState("")
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date()
    const offset = now.getTimezoneOffset() * 60000
    return new Date(now.getTime() - offset).toISOString().slice(0, 16)
  })
  const [submitting, setSubmitting] = useState(false)
  const { mutate: mutateRecords } = useRecords(babyId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content) return
    setSubmitting(true)
    try {
      await createNote(Number(babyId), {
        content,
        note_time: new Date(timestamp).toISOString()
      })
      setContent("")
      onOpenChange(false)
      mutateRecords()
    } catch (err: unknown) {
      console.error(err)
                  const detail = isApiError(err) ? ((err.info as { detail?: string })?.detail || "メモの保存に失敗しました") : "メモの保存に失敗しました"
            alert(detail)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-xl font-bold dark:text-zinc-100">📝 メモを記録</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="noteTime">日時</Label>
            <Input
              id="noteTime"
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="dark:bg-zinc-800 dark:border-zinc-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">内容</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="今日の出来事や赤ちゃんの様子、気持ちなどを自由に書いてください"
              rows={5}
              className="dark:bg-zinc-800 dark:border-zinc-700 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={submitting || !content}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {submitting ? "保存中..." : "保存する"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
