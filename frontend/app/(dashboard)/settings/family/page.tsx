"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/useAuth"
import { useFamilySettings, useFamilyMembers } from "@/hooks/useData"
import { FamilyNameForm } from "@/components/settings/FamilyNameForm"
import { InviteCodeCard } from "@/components/settings/InviteCodeCard"
import { MemberList } from "@/components/settings/MemberList"

export default function FamilySettingsPage() {
    const { user, isLoading: userLoading } = useUser()
    const { family, isLoading: familyLoading, mutate: mutateFamily } = useFamilySettings()
    const { members, isLoading: membersLoading, mutate: mutateMembers } = useFamilyMembers()

    if (userLoading || familyLoading || membersLoading) {
        return (
            <div className="flex items-center justify-center min-h-64 text-gray-400">
                読み込み中...
            </div>
        )
    }

    if (!user || !family) return null

    // 現在のユーザーのロールを取得
    const currentMember = members?.find((m) => m.username === user.username)
    const isAdmin = currentMember?.role === "admin"

    const handleFamilyUpdated = () => {
        mutateFamily()
    }

    const handleMembersUpdated = () => {
        mutateMembers()
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* sticky header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm h-14 flex items-center justify-center px-4">
                <h1 className="text-base font-semibold text-gray-900">家族設定</h1>
            </header>

            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {/* 家族名 */}
                <FamilyNameForm
                    name={family.name}
                    isAdmin={isAdmin}
                    onUpdated={handleFamilyUpdated}
                />

                {/* 招待コード */}
                <InviteCodeCard
                    inviteCode={family.invite_code}
                    isAdmin={isAdmin}
                    onRegenerated={handleFamilyUpdated}
                />

                {/* メンバー一覧 */}
                {members && (
                    <MemberList
                        members={members}
                        currentUserId={currentMember?.user_id ?? -1}
                        isAdmin={isAdmin}
                        onUpdated={handleMembersUpdated}
                    />
                )}
            </div>
        </div>
    )
}
