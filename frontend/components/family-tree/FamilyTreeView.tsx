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

  const slot = (type: RelationshipType) =>
    parentSlots.find((s) => s.relationshipType === type) ??
    grandparentSlots.find((s) => s.relationshipType === type)

  return (
    <>
      <div className="py-4 space-y-4">
        {/*
         * 2列構造: 左=母方, 右=父方
         * 各列で祖父母と親を縦に並べることで、祖父母が対応する親の真上に来る
         */}
        <div className="flex items-end gap-2 justify-center">
          {/* ===== 左列: 母方 ===== */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
            {/* 母方祖父母 */}
            <div className="flex gap-2 border border-border rounded-lg p-2 bg-muted/30">
              {grandparentSlots
                .filter((s) => s.relationshipType.startsWith("maternal"))
                .map(renderSlot)}
            </div>
            <div className="w-px h-3 bg-border" />
            {/* 母方叔父叔母 + 母 */}
            <div className="flex gap-2 items-center justify-end w-full">
              <div className="flex gap-2 border border-dashed border-border rounded-lg p-2">
                {(["maternal_uncle", "maternal_aunt"] as RelationshipType[]).flatMap((t) => {
                  const s = slot(t)
                  return s ? [renderSlot(s)] : []
                })}
              </div>
              <div className="border border-border rounded-lg p-2 bg-primary/5">
                {(() => {
                  const s = slot("mother")
                  return s ? renderSlot(s) : null
                })()}
              </div>
            </div>
          </div>

          {/* 中央の横線（父母のカップル接続） */}
          <div className="flex-shrink-0 self-end pb-[18px]">
            <div className="h-px w-6 bg-border" />
          </div>

          {/* ===== 右列: 父方 ===== */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
            {/* 父方祖父母 */}
            <div className="flex gap-2 border border-border rounded-lg p-2 bg-muted/30">
              {grandparentSlots
                .filter((s) => s.relationshipType.startsWith("paternal"))
                .map(renderSlot)}
            </div>
            <div className="w-px h-3 bg-border" />
            {/* 父 + 父方叔父叔母 */}
            <div className="flex gap-2 items-center justify-start w-full">
              <div className="border border-border rounded-lg p-2 bg-primary/5">
                {(() => {
                  const s = slot("father")
                  return s ? renderSlot(s) : null
                })()}
              </div>
              <div className="flex gap-2 border border-dashed border-border rounded-lg p-2">
                {(["paternal_uncle", "paternal_aunt"] as RelationshipType[]).flatMap((t) => {
                  const s = slot(t)
                  return s ? [renderSlot(s)] : []
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 接続線: 父母から赤ちゃんへ */}
        <div className="flex justify-center">
          <div className="w-px h-4 bg-border" />
        </div>

        {/* 兄弟姉妹 + 赤ちゃん行 */}
        <div className="flex justify-center items-end gap-2">
          <div className="flex gap-2 border border-dashed border-border rounded-lg p-2">
            {siblingSlots
              .filter(
                (s) =>
                  s.relationshipType === "older_brother" || s.relationshipType === "older_sister"
              )
              .map(renderSlot)}
          </div>

          {/* 赤ちゃん */}
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg border-2 border-primary bg-primary/5 min-w-[64px]">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Baby className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[11px] font-semibold text-primary truncate max-w-[72px]">
              {baby?.name ?? "赤ちゃん"}
            </span>
            {baby?.birthday && (
              <span className="text-[9px] text-muted-foreground leading-tight">
                {new Date(baby.birthday).toLocaleDateString("ja-JP", {
                  month: "numeric",
                  day: "numeric",
                })}
                生
              </span>
            )}
          </div>

          <div className="flex gap-2 border border-dashed border-border rounded-lg p-2">
            {siblingSlots
              .filter(
                (s) =>
                  s.relationshipType === "younger_brother" ||
                  s.relationshipType === "younger_sister"
              )
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
