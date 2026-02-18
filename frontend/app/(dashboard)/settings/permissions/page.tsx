"use client"

import Link from "next/link"
import { ChevronLeft, ShieldCheck, Loader2 } from "lucide-react"
import { usePermissionsPage } from "@/hooks/usePermissionsPage"
import { MemberPermissionCard } from "@/components/settings/MemberPermissionCard"
import { ErrorMessage } from "@/components/ui/error-message"

export default function PermissionsPage() {
  const { memberPermissions, isLoading, mutate } = usePermissionsPage()

  const handleSaved = () => {
    mutate()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-zinc-800 h-14 flex items-center px-4 gap-3">
        <Link
          href="/settings"
          className="p-1 -ml-1 text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-violet-600" />
          <h1 className="text-base font-semibold text-gray-900 dark:text-zinc-100">
            権限管理
          </h1>
        </div>
      </header>

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
