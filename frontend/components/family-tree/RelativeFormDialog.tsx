"use client"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getErrorMessage } from "@/lib/api"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { useFamilyMembers } from "@/hooks/useFamily"
import type { Relative, RelativeCreate, RelativeUpdate, RelationshipType } from "@/types/relative"
import { RELATIONSHIP_LABELS } from "@/lib/relativeUtils"

interface Props {
  open: boolean
  onClose: () => void
  /** 新規追加時はnull、編集時は既存レコード */
  relative: Relative | null
  /** 新規追加時の続柄プリセット */
  defaultRelationshipType?: RelationshipType
  onAdd: (data: RelativeCreate) => Promise<unknown>
  onUpdate: (id: number, data: RelativeUpdate) => Promise<unknown>
  onDelete: (id: number) => Promise<void>
}

/**
 * RelativeFormDialog の内部フォーム。
 * open が true になるたびに親から key を変えて re-mount することで
 * 初期値を正しくリセットする（useEffect での setState を避けるため）。
 */
function RelativeForm({
  relative,
  defaultRelationshipType,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
}: Omit<Props, "open">) {
  const [name, setName] = useState(relative?.name ?? "")
  const [notes, setNotes] = useState(relative?.notes ?? "")
  const [userId, setUserId] = useState<string>(
    relative?.user_id != null ? String(relative.user_id) : ""
  )
  const [error, setError] = useState<string | null>(null)
  const { loading: isSubmitting, execute } = useAsyncAction()
  const { members } = useFamilyMembers()

  const relationshipType = relative?.relationship_type ?? defaultRelationshipType
  const label = relationshipType ? RELATIONSHIP_LABELS[relationshipType] : ""
  const isEdit = !!relative

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("名前を入力してください")
      return
    }
    if (!relationshipType) return
    setError(null)

    const parsedUserId = userId ? parseInt(userId, 10) : null

    await execute(
      async () => {
        if (isEdit) {
          await onUpdate(relative!.id, {
            name: name.trim(),
            notes: notes.trim() || null,
            user_id: parsedUserId,
          })
        } else {
          await onAdd({
            name: name.trim(),
            relationship_type: relationshipType,
            notes: notes.trim() || null,
            user_id: parsedUserId,
          })
        }
        onClose()
      },
      {
        onError: (err) => setError(getErrorMessage(err, "保存に失敗しました")),
      }
    )
  }

  const handleDelete = async () => {
    if (!relative) return
    await execute(
      async () => {
        await onDelete(relative.id)
        onClose()
      },
      {
        onError: (err) => setError(getErrorMessage(err, "削除に失敗しました")),
      }
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {label} {isEdit ? "を編集" : "を追加"}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="relative-name">名前</Label>
          <Input
            id="relative-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 田中太郎"
            maxLength={100}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="relative-user">アプリユーザーと紐付け（任意）</Label>
          <select
            id="relative-user"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">紐付けなし</option>
            {members?.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.display_name || m.username}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="relative-notes">メモ（任意）</Label>
          <Input
            id="relative-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="例: 元気なおじいちゃん"
            maxLength={500}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        {isEdit && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="mr-auto"
          >
            削除
          </Button>
        )}
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isEdit ? "保存" : "追加"}
        </Button>
      </DialogFooter>
    </>
  )
}

export function RelativeFormDialog({ open, onClose, relative, defaultRelationshipType, onAdd, onUpdate, onDelete }: Props) {
  // key を変えることで open のたびにフォームを re-mount し、初期値を正しくリセットする
  const formKey = open
    ? `${relative?.id ?? "new"}-${defaultRelationshipType ?? ""}`
    : "closed"

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <RelativeForm
          key={formKey}
          relative={relative}
          defaultRelationshipType={defaultRelationshipType}
          onClose={onClose}
          onAdd={onAdd}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      </DialogContent>
    </Dialog>
  )
}
