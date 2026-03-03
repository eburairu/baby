"use client"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { api, isApiError } from "@/lib/api"
import { UserRole } from "@/lib/constants"
import { FamilyMember } from "@/types/family"

interface Props {
    member: FamilyMember | null
    open: boolean
    onClose: () => void
    onUpdated: () => void
}

export function MemberRoleDialog({ member, open, onClose, onUpdated }: Props) {
    const [selectedRole, setSelectedRole] = useState<string>(UserRole.MEMBER)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleOpen = () => {
        if (member) setSelectedRole(member.role)
        setError(null)
    }

    const handleSave = async () => {
        if (!member) return
        setSaving(true)
        setError(null)
        try {
            await api.patch(`/family/members/${member.user_id}/role`, { role: selectedRole })
            onUpdated()
            onClose()
        } catch (e: unknown) {
            if (isApiError(e)) {
                setError((e.info as { detail?: string })?.detail || "ロール変更に失敗しました")
            } else {
                setError("ロール変更に失敗しました")
            }
        } finally {
            setSaving(false)
        }
    }

    const roles = [
        { value: UserRole.ADMIN, label: "管理者", desc: "全ての設定を変更できる管理者" },
        { value: UserRole.MEMBER, label: "メンバー", desc: "記録の閲覧・追加ができるメンバー" },
        { value: UserRole.VIEWER, label: "閲覧者", desc: "記録の閲覧のみができる閲覧者" },
    ]

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }} >
            <DialogContent onOpenAutoFocus={handleOpen}>
                <DialogHeader>
                    <DialogTitle>ロールを変更: {member?.username}</DialogTitle>
                </DialogHeader>
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
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={saving}>キャンセル</Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || selectedRole === member?.role}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        変更する
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
