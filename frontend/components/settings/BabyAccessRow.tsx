"use client"

import { useState, useId } from "react"
import { Baby, ChevronDown, ChevronUp } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import type { BabyAccess } from "@/hooks/usePermissionsPage"
import { updateBabyPermissions } from "@/hooks/useBabyPermissions"

const RECORD_TYPE_LABELS: Record<string, string> = {
  baby: "赤ちゃん情報",
  feeding: "授乳",
  sleep: "睡眠",
  diaper: "おむつ",
  growth: "成長",
  contraction: "陣痛",
  schedule: "スケジュール",
  note: "メモ",
}

interface Props {
  userId: number
  babyAccess: BabyAccess
  onSaved: () => void
}

export function BabyAccessRow({ userId, babyAccess, onSaved }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const uniqueId = useId()
  const detailsId = `access-details-${uniqueId}`

  const hasBabyAccess = babyAccess.permissions["baby"] === true
  const hasAllAccess = Object.values(babyAccess.permissions).every((v) => v === true)

  const applyBulk = async (canView: boolean) => {
    setSaving(true)
    try {
      const permissions = Object.keys(babyAccess.permissions).map((rt) => ({
        user_id: userId,
        record_type: rt,
        can_view: canView,
      }))
      await updateBabyPermissions(babyAccess.babyId, permissions)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  const handleToggleType = async (recordType: string, newValue: boolean) => {
    setSaving(true)
    try {
      await updateBabyPermissions(babyAccess.babyId, [
        { user_id: userId, record_type: recordType, can_view: newValue },
      ])
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* 折りたたみヘッダー行 */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span className="text-sm text-gray-700 dark:text-zinc-300 flex-1 font-medium">
          <Baby className="w-4 h-4 inline-block mr-1" /> {babyAccess.babyName}
        </span>

        <div className="flex items-center gap-2">
          {hasBabyAccess ? (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              ✓ アクセスあり
            </span>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => applyBulk(true)}
              disabled={saving}
              className="text-xs h-7 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900 hover:bg-green-50 dark:hover:bg-green-950/30"
            >
              許可する
            </Button>
          )}

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={detailsId}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
            aria-label={expanded ? "折りたたむ" : "詳細設定を開く"}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* 展開時: 記録タイプ別トグル */}
      {expanded && (
        <div id={detailsId} className="px-3 pb-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/40">
          <div className="grid grid-cols-2 gap-2 mt-3">
            {Object.entries(babyAccess.permissions).map(([rt, canView]) => (
              <div
                key={rt}
                className="flex items-center justify-between bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg"
              >
                <span className="text-xs text-gray-600 dark:text-zinc-400">
                  {RECORD_TYPE_LABELS[rt] ?? rt}
                </span>
                <Switch
                  checked={canView}
                  onCheckedChange={(val) => handleToggleType(rt, val)}
                  disabled={saving}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => applyBulk(true)}
              disabled={saving || hasAllAccess}
              className="text-xs h-7"
            >
              全て許可
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => applyBulk(false)}
              disabled={saving || !hasBabyAccess}
              className="text-xs h-7 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              全て拒否
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
