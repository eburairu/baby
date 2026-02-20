"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, Loader2 } from "lucide-react"
import { usePermissionsPage } from "@/hooks/usePermissionsPage"
import { MemberPermissionCard } from "@/components/settings/MemberPermissionCard"
import { SettingsHeader } from "@/components/settings/SettingsHeader"
import { usePermissions } from "@/hooks/usePermissions"
import { useUser } from "@/hooks/useAuth"

export default function PermissionsPage() {
  const { isAdmin } = usePermissions()
  const { isLoading: userLoading } = useUser()
  const router = useRouter()
  const { memberPermissions, isLoading, mutate } = usePermissionsPage()

  // 管理者以外はリダイレクト
  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push("/")
    }
  }, [userLoading, isAdmin, router])

  if (userLoading || isLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    )
  }

  const handleSaved = () => {
    mutate()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <SettingsHeader title="権限管理" icon={ShieldCheck} />

      <div className="max-w-2xl mx-auto p-4 space-y-4 pb-20">
        <p className="text-xs text-gray-500 dark:text-zinc-500">
          メンバーがどの赤ちゃんの情報を閲覧できるか管理します。新規参加者はデフォルトでアクセスなしです。
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        ) : memberPermissions.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-8 text-center">
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              管理対象のメンバーがいません
            </p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
              招待コードを共有してメンバーを追加しましょう
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {memberPermissions.map((member) => (
              <MemberPermissionCard
                key={member.userId}
                member={member}
                onSaved={handleSaved}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
