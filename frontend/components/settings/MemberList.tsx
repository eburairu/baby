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
import { api } from "@/lib/api"
import { getDisplayName } from "@/lib/utils"
import { UserRole } from "@/lib/constants"

interface Member {
    user_id: number
    username: string
    display_name: string | null
    role: string
    joined_at: string
}

interface Props {
    members: Member[]
    currentUserId: number
    isAdmin: boolean
    onUpdated: () => void
}

function formatDate(iso: string) {
    const d = new Date(iso)
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`
}

export function MemberList({ members, currentUserId, isAdmin, onUpdated }: Props) {
    const [roleDialogTarget, setRoleDialogTarget] = useState<Member | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await api.delete(`/family/members/${deleteTarget.user_id}`)
            onUpdated()
        } catch {
            // エラー処理（省略）
        } finally {
            setDeleting(false)
            setDeleteTarget(null)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-violet-600 font-semibold text-sm">
                    👥 メンバー ({members.length}名)
                </span>
            </div>
            <div className="divide-y divide-gray-100">
                {members.map((member) => {
                    const isSelf = member.user_id === currentUserId
                    return (
                        <div key={member.user_id} className="py-3 flex items-center justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{getDisplayName(member)}</span>
                                    <Badge
                                        variant="secondary"
                                        className={member.role === UserRole.ADMIN
                                            ? "bg-violet-100 text-violet-700"
                                            : member.role === UserRole.VIEWER
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-gray-100 text-gray-600"}
                                    >
                                        {member.role === UserRole.ADMIN ? "管理者" : member.role === UserRole.VIEWER ? "閲覧者" : "メンバー"}
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">{formatDate(member.joined_at)}</p>
                            </div>
                            {isAdmin && !isSelf && (
                                <div className="flex gap-2 shrink-0">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs"
                                        onClick={() => setRoleDialogTarget(member)}
                                    >
                                        ロール変更
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="text-xs bg-red-500 hover:bg-red-600 text-white"
                                        onClick={() => setDeleteTarget(member)}
                                    >
                                        削除
                                    </Button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

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
        </div>
    )
}
