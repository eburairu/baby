"use client"
import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/useAuth"
import { useBabies } from "@/hooks/useData"
import { useFamilyMembers } from "@/hooks/useData"
import { BabyCard } from "@/components/settings/BabyCard"
import { BabyEditDialog } from "@/components/settings/BabyEditDialog"
import { AddBabyDialog } from "@/components/settings/AddBabyDialog"
import { BabyDeleteDialog } from "@/components/settings/BabyDeleteDialog"
import { UserRole } from "@/lib/constants"

import { Baby } from "@/types/baby"

/* Removed local Baby interface */

export default function BabySettingsPage() {
    const { user, isLoading: userLoading } = useUser()
    const { babies, isLoading: babiesLoading, mutate } = useBabies()
    const { members, isLoading: membersLoading } = useFamilyMembers()

    const [editTarget, setEditTarget] = useState<Baby | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Baby | null>(null)
    const [addOpen, setAddOpen] = useState(false)

    if (userLoading || babiesLoading || membersLoading) {
        return (
            <div className="flex items-center justify-center min-h-64 text-gray-400">
                読み込み中...
            </div>
        )
    }

    if (!user) return null

    const currentMember = members?.find((m) => m.username === user.username)
    const isAdmin = currentMember?.role === UserRole.ADMIN
    const hasMemberUsers = members?.some((m) => m.role === UserRole.MEMBER || m.role === UserRole.VIEWER) ?? false

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors">
            {/* sticky header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-zinc-800 h-14 flex items-center justify-between px-4">
                <div className="flex items-center">
                    <h1 className="text-base font-semibold text-gray-900 dark:text-zinc-100">赤ちゃん管理</h1>
                </div>
                {isAdmin && (
                    <Button
                        size="sm"
                        onClick={() => setAddOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        赤ちゃんを追加
                    </Button>
                )}
            </header>

            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {!babies || babies.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-8 text-center transition-colors">
                        <p className="text-gray-400 dark:text-zinc-500 text-sm mb-4">👶 まだ赤ちゃんが登録されていません</p>
                        {isAdmin && (
                            <Button
                                onClick={() => setAddOpen(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                最初の赤ちゃんを追加
                            </Button>
                        )}
                    </div>
                ) : (
                    babies.map((baby: Baby) => (
                        <BabyCard
                            key={baby.id}
                            baby={baby}
                            isAdmin={isAdmin}
                            hasMemberUsers={hasMemberUsers}
                            onEdit={setEditTarget}
                            onDelete={setDeleteTarget}
                        />
                    ))
                )}
            </div>

            <BabyEditDialog
                baby={editTarget}
                open={editTarget !== null}
                onClose={() => setEditTarget(null)}
                onUpdated={() => { mutate(); setEditTarget(null) }}
            />

            <BabyDeleteDialog
                baby={deleteTarget}
                open={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onDeleted={() => { mutate(); setDeleteTarget(null) }}
            />

            <AddBabyDialog
                open={addOpen}
                onClose={() => setAddOpen(false)}
                onAdded={() => mutate()}
            />
        </div>
    )
}
