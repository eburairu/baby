"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { BabyRecord } from "@/hooks/useData"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

interface Props {
  record: BabyRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const TYPE_LABELS: Record<string, string> = {
  feeding: "授乳",
  sleep: "睡眠",
  diaper: "おむつ",
  growth: "成長",
  note: "メモ",
  contraction: "陣痛",
}

export function RecordDetailDialog({ record, open, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState("")
  const [timestamp, setTimestamp] = useState("")

  useEffect(() => {
    if (record) {
      setNotes(record.details.notes || "")
      // Convert to local time string for input
      const date = new Date(record.timestamp)
      const localIso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
      setTimestamp(localIso)
    }
  }, [record])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!record) return

    setLoading(true)
    try {
      let endpoint = ""
      const isoTimestamp = new Date(timestamp).toISOString()
      const body: Record<string, string | null> = { notes }

      switch (record.type) {
        case "feeding":
          endpoint = `/feedings/${record.id}`
          body.feeding_time = isoTimestamp
          await api.patch(endpoint, body)
          break
        case "sleep":
          endpoint = `/sleeps/${record.id}`
          body.start_time = isoTimestamp
          await api.patch(endpoint, body)
          break
        case "diaper":
          endpoint = `/diapers/${record.id}`
          body.change_time = isoTimestamp
          await api.put(endpoint, body)
          break
        case "growth":
          endpoint = `/growths/${record.id}`
          body.date = isoTimestamp.split('T')[0] // Growth uses date only
          await api.put(endpoint, body)
          break
        case "note":
          endpoint = `/notes/${record.id}`
          await api.patch(endpoint, { content: notes, note_time: isoTimestamp })
          break
        case "contraction":
          endpoint = `/contractions/${record.id}`
          body.start_time = isoTimestamp
          await api.patch(endpoint, body)
          break
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      alert("更新に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!record || !confirm("この記録を削除してもよろしいですか？")) return

    setLoading(true)
    try {
      let endpoint = ""
      switch (record.type) {
        case "feeding": endpoint = `/feedings/${record.id}`; break
        case "sleep": endpoint = `/sleeps/${record.id}`; break
        case "diaper": endpoint = `/diapers/${record.id}`; break
        case "growth": endpoint = `/growths/${record.id}`; break
        case "note": endpoint = `/notes/${record.id}`; break
        case "contraction": endpoint = `/contractions/${record.id}`; break
      }
      await api.delete(endpoint)
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      alert("削除に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  if (!record) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-zinc-900 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{TYPE_LABELS[record.type] || record.type}の記録</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timestamp" className="text-gray-700 dark:text-zinc-300">日時</Label>
              <Input
                id="timestamp"
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="dark:bg-zinc-800 dark:border-zinc-700"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700 dark:text-zinc-300">メモ</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder="メモを入力..."
                className="dark:bg-zinc-800 dark:border-zinc-700 resize-none"
              />
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                disabled={loading}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 sm:mr-auto"
              >
                削除
              </Button>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="dark:border-zinc-700"
                >
                  キャンセル
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {loading ? "保存中..." : "保存する"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
