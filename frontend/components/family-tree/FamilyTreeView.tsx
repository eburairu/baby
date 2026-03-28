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

  const findParentSlot = (type: RelationshipType) =>
    parentSlots.find((s) => s.relationshipType === type)!

  return (
    <>
      <div className="py-4 space-y-2">
        {/*
         * レイアウト: 左=母方 / 右=父方 の2列で統一
         * 祖父母行と親行を別の横行にして、同じ flex-1 幅で揃える
         *   → 祖父母が常に祖父母段、親が常に親段に表示される
         */}

        {/* ── 祖父母行 ── */}
        <div className="flex gap-4 justify-center">
          {/* 母方祖父母 */}
          <div className="flex-1 max-w-[200px] flex justify-center">
            <div className="flex gap-2 border border-border rounded-lg p-2 bg-muted/30">
              {grandparentSlots
                .filter((s) => s.relationshipType.startsWith("maternal"))
                .map(renderSlot)}
            </div>
          </div>
          {/* 父方祖父母 */}
          <div className="flex-1 max-w-[200px] flex justify-center">
            <div className="flex gap-2 border border-border rounded-lg p-2 bg-muted/30">
              {grandparentSlots
                .filter((s) => s.relationshipType.startsWith("paternal"))
                .map(renderSlot)}
            </div>
          </div>
        </div>

        {/* 接続線（祖父母 → 親） */}
        <div className="flex gap-4 justify-center">
          <div className="flex-1 max-w-[200px] flex justify-center">
            <div className="w-px h-3 bg-border" />
          </div>
          <div className="flex-1 max-w-[200px] flex justify-center">
            <div className="w-px h-3 bg-border" />
          </div>
        </div>

        {/* ── 親・叔父叔母行 ── */}
        <div className="flex gap-2 justify-center items-center">
          {/* 母方: 叔父叔母(外) → 母(内) */}
          <div className="flex-1 max-w-[200px] flex justify-end items-center gap-2">
            <div className="flex gap-2 border border-dashed border-border rounded-lg p-2">
              {renderSlot(findParentSlot("maternal_uncle"))}
              {renderSlot(findParentSlot("maternal_aunt"))}
            </div>
            <div className="border border-border rounded-lg p-2 bg-primary/5">
              {renderSlot(findParentSlot("mother"))}
            </div>
          </div>

          {/* 中央の横線（父母カップル） */}
          <div className="h-px w-6 bg-border flex-shrink-0" />

          {/* 父方: 父(内) → 叔父叔母(外) */}
          <div className="flex-1 max-w-[200px] flex justify-start items-center gap-2">
            <div className="border border-border rounded-lg p-2 bg-primary/5">
              {renderSlot(findParentSlot("father"))}
            </div>
            <div className="flex gap-2 border border-dashed border-border rounded-lg p-2">
              {renderSlot(findParentSlot("paternal_uncle"))}
              {renderSlot(findParentSlot("paternal_aunt"))}
            </div>
          </div>
        </div>

        {/* 接続線（親 → 赤ちゃん） */}
        <div className="flex justify-center">
          <div className="w-px h-4 bg-border" />
        </div>

        {/* ── 兄弟姉妹 + 赤ちゃん行 ── */}
        <div className="flex justify-center items-end gap-2">
          <div className="flex gap-2 border border-dashed border-border rounded-lg p-2">
            {siblingSlots
              .filter(
                (s) =>
                  s.relationshipType === "older_brother" ||
                  s.relationshipType === "older_sister"
              )
              .map(renderSlot)}
          </div>

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
