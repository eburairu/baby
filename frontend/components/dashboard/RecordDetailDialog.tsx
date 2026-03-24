"use client"
import { RECORD_TYPES } from '@/types/enums';


import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BabyRecord } from "@/types/record"
import { usePermissions } from "@/hooks/usePermissions"
import { useUser } from "@/hooks/useAuth"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { CommentSection } from "@/components/records/CommentSection"
import { EditDialogBase } from "@/components/records/EditDialogBase"
import { api, isApiError } from "@/lib/api"
import { getRecordEndpoint } from "@/lib/recordUtils"
import { formatJapaneseDateTime, formatDateLocal } from "@/lib/dateUtils"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { RECORD_TYPE_LABELS } from "@/constants/ui"

interface Props {
  record: BabyRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RecordDetailDialog({ record, open, onOpenChange, onSuccess }: Props) {
  const { canWrite } = usePermissions()
  const { user } = useUser()
  const { loading, execute } = useAsyncAction()
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (open && record) {
      // openのタイミングで初期化してcascading rendersを回避するためにsetTimeoutを使用
      const timerId = setTimeout(() => {
        setNotes(record.details.notes || "")
      }, 0)
      return () => clearTimeout(timerId)
    }
  }, [open, record])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!record) return

    await execute(
      async () => {
        const endpoint = getRecordEndpoint(record.type, record.id)
        const isoTimestamp = new Date(record.timestamp).toISOString()
        const body: Record<string, string | null> = { notes }

        switch (record.type) {
          case RECORD_TYPES.FEEDING:
            body.feeding_time = isoTimestamp
            await api.patch(endpoint, body)
            break
          case RECORD_TYPES.SLEEP:
            body.start_time = isoTimestamp
            await api.patch(endpoint, body)
            break
          case RECORD_TYPES.DIAPER:
            body.change_time = isoTimestamp
            await api.put(endpoint, body)
            break
          case RECORD_TYPES.GROWTH:
            // Use format to get YYYY-MM-DD in local time
            body.date = formatDateLocal(new Date(record.timestamp))
            await api.put(endpoint, body)
            break
          case RECORD_TYPES.NOTE:
            await api.patch(endpoint, { content: notes, note_time: isoTimestamp, updated_at: record.updated_at })
            break
          case RECORD_TYPES.CONTRACTION:
            body.start_time = isoTimestamp
            await api.patch(endpoint, body)
            break
        }
      },
      {
        onSuccess: () => {
          onSuccess()
          onOpenChange(false)
        },
        errorMessage: (error: unknown) => {
            if (isApiError(error) && error.status === 409) {
                return "他のユーザーによってデータが更新されました。画面を更新して最新のデータを取得してください。"
            }
            return "更新に失敗しました"
        }
      }
    )
  }

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const handleDelete = async () => {
    if (!record) return

    await execute(
      async () => {
        const endpoint = getRecordEndpoint(record.type, record.id)
        await api.delete(endpoint)
      },
      {
        onSuccess: () => {
          setDeleteConfirmOpen(false)
          onSuccess()
          onOpenChange(false)
        },
        errorMessage: "削除に失敗しました"
      }
    )
  }

  if (!record) return null

  return (
    <>
      <EditDialogBase
        open={open}
        onOpenChange={onOpenChange}
        title={<span>{RECORD_TYPE_LABELS[record.type as keyof typeof RECORD_TYPE_LABELS] || record.type}の記録</span>}
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
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={loading}
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
                    loading={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    保存する
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

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-sentry-unmask>記録の削除</AlertDialogTitle>
            <AlertDialogDescription data-sentry-unmask>
              この記録を削除しますか？この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading} data-sentry-unmask>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} data-sentry-unmask className="bg-red-600 hover:bg-red-700" loading={loading}>
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
