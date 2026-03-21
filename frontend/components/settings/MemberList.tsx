"use client"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MemberRoleDialog } from "./MemberRoleDialog"
import { MemberPasswordResetDialog } from "./MemberPasswordResetDialog"
import { api } from "@/lib/api"
import { getDisplayName } from "@/lib/utils"
import { formatDate } from "@/lib/dateUtils"
import { UserRole } from "@/lib/constants"
import { FamilyMember } from "@/types/family"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { SettingsCard } from "./SettingsCard"
import { ROLE_LABELS } from "@/constants/ui"

interface Props {
    members: FamilyMember[]
    currentUserId: number
    isAdmin: boolean
    onUpdated: () => void
}

export function MemberList({ members, currentUserId, isAdmin, onUpdated }: Props) {
    const [roleDialogTarget, setRoleDialogTarget] = useState<FamilyMember | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<FamilyMember | null>(null)
    const [passwordResetTarget, setPasswordResetTarget] = useState<FamilyMember | null>(null)
    const { loading: deleting, execute } = useAsyncAction()

    const handleDelete = async () => {
        if (!deleteTarget) return

        try {
            await execute(
                async () => {
                    await api.delete(`/family/members/${deleteTarget.user_id}`)
                    onUpdated()
                }
            )
        } finally {
            setDeleteTarget(null)
        }
    }

    return (
        <SettingsCard>
            <div className="flex items-center gap-2 mb-3">
                <span className="text-violet-600 dark:text-violet-400 font-semibold text-sm">
                    👥 メンバー ({members.length}名)
                </span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {members.map((member) => {
                    const isSelf = member.user_id === currentUserId
                    return (
                        <div key={member.user_id} className="py-3 flex items-center justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900 dark:text-zinc-100">{getDisplayName(member)}</span>
                                    <Badge
                                        variant="secondary"
                                        className={member.role === UserRole.ADMIN
                                            ? "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                                            : member.role === UserRole.VIEWER
                                                ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                                                : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"}
                                    >
                                        {ROLE_LABELS[member.role] ?? member.role}
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{formatDate(member.joined_at)}</p>
                            </div>
                            {isAdmin && !isSelf && (
                                <div className="flex gap-2 shrink-0">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                                        onClick={() => setRoleDialogTarget(member)}
                                        aria-label={`${getDisplayName(member)}の権限を変更`}
                                    >
                                        ロール変更
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="text-xs bg-red-500 hover:bg-red-600 text-white shadow-none"
                                        onClick={() => setDeleteTarget(member)}
                                        aria-label={`${getDisplayName(member)}を家族から削除`}
                                    >
                                        削除
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                                        onClick={() => setPasswordResetTarget(member)}
                                        aria-label={`${getDisplayName(member)}のパスワードを再発行`}
                                    >
                                        PW再発行
                                    </Button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* パスワード再発行ダイアログ */}
            <MemberPasswordResetDialog
                member={passwordResetTarget}
                open={!!passwordResetTarget}
                onClose={() => setPasswordResetTarget(null)}
            />

            {/* ロール変更ダイアログ */}
            <MemberRoleDialog
                member={roleDialogTarget}
                open={!!roleDialogTarget}
                onClose={() => setRoleDialogTarget(null)}
                onUpdated={onUpdated}
            />

            {/* 削除確認ダイアログ */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{deleteTarget ? getDisplayName(deleteTarget) : ""} を削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                            このメンバーを家族グループから削除します。この操作は元に戻せません。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            削除する
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SettingsCard>
    )
}
