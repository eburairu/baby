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
import { api } from "@/lib/api"

interface Member {
    user_id: number
    username: string
    role: string
}

interface Props {
    member: Member | null
    open: boolean
    onClose: () => void
    onUpdated: () => void
}

export function MemberRoleDialog({ member, open, onClose, onUpdated }: Props) {
    const [selectedRole, setSelectedRole] = useState<"admin" | "member">("member")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleOpen = () => {
        if (member) setSelectedRole(member.role as "admin" | "member")
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
        } catch (e: any) {
            setError(e?.info?.detail || "ロール変更に失敗しました")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }} >
            <DialogContent onOpenAutoFocus={handleOpen}>
                <DialogHeader>
                    <DialogTitle>ロールを変更: {member?.username}</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 py-2">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {(["admin", "member"] as const).map((role) => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${selectedRole === role
                                ? "border-indigo-600 bg-indigo-50"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <span className="font-medium capitalize">{role}</span>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {role === "admin"
                                    ? "全ての設定を変更できる管理者"
                                    : "記録の閲覧・追加ができるメンバー"}
                            </p>
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
