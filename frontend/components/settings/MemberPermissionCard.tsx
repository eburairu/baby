"use client"

import { AlertTriangle } from "lucide-react"
import type { MemberPermissions } from "@/hooks/usePermissionsPage"
import { BabyAccessRow } from "./BabyAccessRow"
import { SettingsCard } from "./SettingsCard"
import { ROLE_LABELS } from "@/constants/ui"

interface Props {
  member: MemberPermissions
  onSaved: () => void
}

export function MemberPermissionCard({ member, onSaved }: Props) {
  const displayName = member.displayName ?? member.username
  const roleLabel = ROLE_LABELS[member.role] ?? member.role

  // 赤ちゃんへのアクセスが1件もない場合にバナーを表示
  const hasNoAccess = member.babyAccess.every(
    (ba) => !ba.permissions["baby"]
  )

  return (
    <SettingsCard className="space-y-3">
      {/* メンバー名・ロール */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
        <div>
          <span className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">
            {displayName}
          </span>
          {member.displayName && (
            <span className="text-xs text-gray-400 dark:text-zinc-500 ml-1">
              @{member.username}
            </span>
          )}
        </div>
        <span className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">
          {roleLabel}
        </span>
      </div>

      {/* アクセス未設定バナー */}
      {hasNoAccess && (
        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>全ての赤ちゃんへのアクセスが未設定です</span>
        </div>
      )}

      {/* 赤ちゃんごとのアクセス行 */}
      <div className="space-y-2">
        {member.babyAccess.map((ba) => (
          <BabyAccessRow
            key={ba.babyId}
            userId={member.userId}
            babyAccess={ba}
            onSaved={onSaved}
          />
        ))}
        {member.babyAccess.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-2">
            赤ちゃんが登録されていません
          </p>
        )}
      </div>
    </SettingsCard>
  )
}
