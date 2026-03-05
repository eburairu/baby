"use client"
import { RECORD_TYPES } from '@/types/enums';


import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BabyRecord } from "@/types/record"
import { usePermissions } from "@/hooks/usePermissions"
import { useUser } from "@/hooks/useAuth"
import { useRecordDelete } from "@/hooks/useRecordDelete"
import { CommentSection } from "@/components/records/CommentSection"
import { EditDialogBase } from "@/components/records/EditDialogBase"
import { api } from "@/lib/api"
import { formatJapaneseDateTime, formatDateLocal } from "@/lib/dateUtils"
import { getRecordEndpoint } from "@/lib/recordUtils"

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
  const { canWrite } = usePermissions()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (record) {
      setNotes(record.details.notes || "")
    }
  }, [record])

  const { setDeleteTargetId, ConfirmDeleteDialog, isDeleting } = useRecordDelete({
    resourceName: "記録",
    onDelete: async () => {
      if (!record) return
      const endpoint = getRecordEndpoint(record.type, record.id)
      await api.delete(endpoint)
    },
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!record) return

    setLoading(true)
    try {
      const endpoint = getRecordEndpoint(record.type, record.id)
      const isoTimestamp = new Date(record.timestamp).toISOString()
      const body: Record<string, string | null> = { notes }

      switch (record.type) {
        case RECORD_TYPES.FEEDING:
          body.feeding_time = isoTimestamp
          await api.patch(endpoint, body)
          break
        case "sleep":
          body.start_time = isoTimestamp
          await api.patch(endpoint, body)
          break
        case "diaper":
          body.change_time = isoTimestamp
          await api.put(endpoint, body)
          break
        case "growth":
          // Use format to get YYYY-MM-DD in local time
          body.date = formatDateLocal(new Date(record.timestamp))
          await api.put(endpoint, body)
          break
        case "note":
          await api.patch(endpoint, { content: notes, note_time: isoTimestamp })
          break
        case "contraction":
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

  if (!record) return null

  return (
    <>
      <EditDialogBase
        open={open}
        onOpenChange={onOpenChange}
        title={<span>{TYPE_LABELS[record.type] || record.type}の記録</span>}
      >
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-zinc-300">日時</Label>
              <div className="text-sm p-2 bg-gray-50 dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700 text-gray-600 dark:text-zinc-400">
                {record.timestamp ? formatJapaneseDateTime(new Date(record.timestamp)) : "-"}
              </div>
            </div>

            {record.recorded_by_display_name && (
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-zinc-300">記録者</Label>
                <div className="text-sm p-2 bg-gray-50 dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700 text-gray-600 dark:text-zinc-400">
                  {record.recorded_by_display_name}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700 dark:text-zinc-300">メモ</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder={canWrite ? "メモを入力..." : ""}
                className="dark:bg-zinc-800 dark:border-zinc-700 resize-none"
                disabled={!canWrite}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t dark:border-zinc-800">
              {canWrite && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDeleteTargetId(record.id)}
                  disabled={loading || isDeleting}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 sm:mr-auto"
                >
                  削除
                </Button>
              )}
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="dark:border-zinc-700"
                >
                  {canWrite ? "キャンセル" : "閉じる"}
                </Button>
                {canWrite && (
                  <Button 
                    type="submit" 
                    disabled={loading || isDeleting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {loading ? "保存中..." : "保存する"}
                  </Button>
                )}
              </div>
            </div>
          </form>

          {/* コメントセクションの追加 */}
          <CommentSection
            recordType={record.type}
            recordId={record.id}
            currentUserId={user?.id}
            onCommentChange={onSuccess}
          />
        </div>
      </EditDialogBase>

      <ConfirmDeleteDialog />
    </>
  )
}
