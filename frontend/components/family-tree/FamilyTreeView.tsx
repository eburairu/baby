"use client"
import { useState } from "react"
import { Baby } from "lucide-react"
import { RelativeCard } from "./RelativeCard"
import { RelativeFormDialog } from "./RelativeFormDialog"
import { TREE_LAYOUT, getRelativesByType } from "@/lib/relativeUtils"
import type { Relative, RelativeCreate, RelativeUpdate, RelationshipType } from "@/types/relative"
import type { Baby as BabyType } from "@/types/baby"

interface Props {
  relatives: Relative[]
  baby: BabyType | null
  canWrite: boolean
  onAdd: (data: RelativeCreate) => Promise<unknown>
  onUpdate: (id: number, data: RelativeUpdate) => Promise<unknown>
  onDelete: (id: number) => Promise<void>
}

interface DialogState {
  open: boolean
  relative: Relative | null
  defaultType?: RelationshipType
}

export function FamilyTreeView({ relatives, baby, canWrite, onAdd, onUpdate, onDelete }: Props) {
  const [dialog, setDialog] = useState<DialogState>({ open: false, relative: null })

  const openAdd = (type: RelationshipType) => {
    setDialog({ open: true, relative: null, defaultType: type })
  }

  const openEdit = (relative: Relative) => {
    setDialog({ open: true, relative, defaultType: undefined })
  }

  const closeDialog = () => setDialog((d) => ({ ...d, open: false }))

  // グリッド列インデックス → 該当スロットのカードをレンダリング
  const renderSlot = (slot: (typeof TREE_LAYOUT)[number]) => {
    const items = getRelativesByType(relatives, slot.relationshipType)

    if (slot.multi) {
      return (
        <div key={slot.relationshipType} className="flex flex-wrap gap-1 justify-center">
          {items.map((r) => (
            <RelativeCard
              key={r.id}
              relative={r}
              relationshipType={slot.relationshipType}
              canWrite={canWrite}
              onClick={() => openEdit(r)}
            />
          ))}
          {/* 複数登録可能なので常に「追加」カードを表示 */}
          {canWrite && (
            <RelativeCard
              relative={null}
              relationshipType={slot.relationshipType}
              canWrite={canWrite}
              onClick={() => openAdd(slot.relationshipType)}
            />
          )}
        </div>
      )
    }

    const item = items[0] ?? null
    return (
      <RelativeCard
        key={slot.relationshipType}
        relative={item}
        relationshipType={slot.relationshipType}
        canWrite={canWrite}
        onClick={() => (item ? openEdit(item) : openAdd(slot.relationshipType))}
      />
    )
  }

  const grandparentSlots = TREE_LAYOUT.filter((s) => s.row === "grandparents")
  const parentSlots = TREE_LAYOUT.filter((s) => s.row === "parents")
  const siblingSlots = TREE_LAYOUT.filter((s) => s.row === "siblings")

  // 指定した順序でスロットを取得するヘルパー
  const getSlotsOrdered = (types: RelationshipType[]) =>
    types.map((t) => parentSlots.find((s) => s.relationshipType === t)).filter(
      (s): s is (typeof TREE_LAYOUT)[number] => s !== undefined
    )

  return (
    <>
      <div className="space-y-6 py-4">
        {/* 祖父母行: 左=母方、右=父方 */}
        <div className="flex justify-center gap-2">
          {/* 母方祖父母 */}
          <div className="flex gap-2 border border-border rounded-lg p-2 bg-muted/30">
            {grandparentSlots
              .filter((s) => s.relationshipType.startsWith("maternal"))
              .map(renderSlot)}
          </div>
          <div className="w-8" />
          {/* 父方祖父母 */}
          <div className="flex gap-2 border border-border rounded-lg p-2 bg-muted/30">
            {grandparentSlots
              .filter((s) => s.relationshipType.startsWith("paternal"))
              .map(renderSlot)}
          </div>
        </div>

        {/* 接続線 */}
        <div className="flex justify-center">
          <div className="w-px h-4 bg-border" />
        </div>

        {/* 親・叔父叔母行: 左=母方叔父叔母、中=母・父、右=父方叔父叔母 */}
        <div className="flex justify-center gap-2 flex-wrap">
          {/* 母方叔父叔母 */}
          <div className="flex gap-2 border border-dashed border-border rounded-lg p-2">
            {getSlotsOrdered(["maternal_uncle", "maternal_aunt"]).map(renderSlot)}
          </div>
          {/* 父母（母→父の順） */}
          <div className="flex gap-2 border border-border rounded-lg p-2 bg-primary/5">
            {getSlotsOrdered(["mother", "father"]).map(renderSlot)}
          </div>
          {/* 父方叔父叔母 */}
          <div className="flex gap-2 border border-dashed border-border rounded-lg p-2">
            {getSlotsOrdered(["paternal_uncle", "paternal_aunt"]).map(renderSlot)}
          </div>
        </div>

        {/* 接続線 */}
        <div className="flex justify-center">
          <div className="w-px h-4 bg-border" />
        </div>

        {/* 兄弟姉妹 + 赤ちゃん行 */}
        <div className="flex justify-center items-end gap-2">
          {/* 兄姉 */}
          <div className="flex gap-2 border border-dashed border-border rounded-lg p-2">
            {siblingSlots
              .filter((s) => s.relationshipType === "older_brother" || s.relationshipType === "older_sister")
              .map(renderSlot)}
          </div>

          {/* 赤ちゃん（中心） */}
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg border-2 border-primary bg-primary/5 min-w-[64px]">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Baby className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[11px] font-semibold text-primary truncate max-w-[72px]">
              {baby?.name ?? "赤ちゃん"}
            </span>
            {baby?.birthday && (
              <span className="text-[9px] text-muted-foreground leading-tight">
                {new Date(baby.birthday).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}生
              </span>
            )}
          </div>

          {/* 弟妹 */}
          <div className="flex gap-2 border border-dashed border-border rounded-lg p-2">
            {siblingSlots
              .filter((s) => s.relationshipType === "younger_brother" || s.relationshipType === "younger_sister")
              .map(renderSlot)}
          </div>
        </div>
      </div>

      <RelativeFormDialog
        open={dialog.open}
        onClose={closeDialog}
        relative={dialog.relative}
        defaultRelationshipType={dialog.defaultType}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </>
  )
}
