"use client"
import { useState } from "react"
import { DialogFooter } from "@/components/ui/dialog"
import { EditDialogBase } from "@/components/records/EditDialogBase"
import { Button } from "@/components/ui/button"
import { api, getErrorMessage } from "@/lib/api"
import { UserRole } from "@/lib/constants"
import { FamilyMember } from "@/types/family"
import { useAsyncAction } from "@/hooks/useAsyncAction"

interface Props {
    member: FamilyMember | null
    open: boolean
    onClose: () => void
    onUpdated: () => void
}

export function MemberRoleDialog({ member, open, onClose, onUpdated }: Props) {
    const [selectedRole, setSelectedRole] = useState<string>(UserRole.MEMBER)
    const [error, setError] = useState<string | null>(null)
    const { loading: saving, execute } = useAsyncAction()

    const handleOpen = () => {
        if (member) setSelectedRole(member.role)
        setError(null)
    }

    const handleSave = async () => {
        if (!member) return
        setError(null)

        await execute(
            async () => {
                await api.patch(`/family/members/${member.user_id}/role`, { role: selectedRole })
                onUpdated()
                onClose()
            },
            {
                onError: (e) => {
                    setError(getErrorMessage(e, "ロール変更に失敗しました"))
                }
            }
        )
    }

    const roles = [
        { value: UserRole.ADMIN, label: "管理者", desc: "全ての設定を変更できる管理者" },
        { value: UserRole.MEMBER, label: "メンバー", desc: "記録の閲覧・追加ができるメンバー" },
        { value: UserRole.VIEWER, label: "閲覧者", desc: "記録の閲覧のみができる閲覧者" },
    ]

    return (
        <EditDialogBase
            open={open}
            onOpenChange={(v) => { if (!v) onClose() }}
            onOpenAutoFocus={handleOpen}
            title={`ロールを変更: ${member?.username}`}
        >
            <div className="flex flex-col gap-4">
                <div className="space-y-2 py-2">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {roles.map((role) => (
                        <button
                            key={role.value}
                            onClick={() => setSelectedRole(role.value)}
                            aria-pressed={selectedRole === role.value}
                            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 ${selectedRole === role.value
                                ? "border-indigo-600 bg-indigo-50"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <span className="font-medium">{role.label}</span>
                            <p className="text-xs text-gray-500 mt-0.5">{role.desc}</p>
                        </button>
                    ))}
                </div>
                <DialogFooter className="border-t dark:border-zinc-800 pt-4 mt-2">
                    <Button variant="outline" onClick={onClose} disabled={saving}>キャンセル</Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || selectedRole === member?.role}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        変更する
                    </Button>
                </DialogFooter>
            </div>
        </EditDialogBase>
    )
}
