"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { SettingsHeader } from "@/components/settings/SettingsHeader"
import { usePermissions } from "@/hooks/usePermissions"

export default function BabySettingsPage() {
    const { user, isLoading: userLoading } = useUser()
    const { isAdmin } = usePermissions()
    const router = useRouter()
    const { babies, isLoading: babiesLoading, mutate } = useBabies()
    const { members, isLoading: membersLoading } = useFamilyMembers()

    const [editTarget, setEditTarget] = useState<Baby | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Baby | null>(null)
    const [addOpen, setAddOpen] = useState(false)

    // 管理者以外はリダイレクト
    useEffect(() => {
        if (!userLoading && !isAdmin) {
            router.push("/")
        }
    }, [userLoading, isAdmin, router])

    if (userLoading || babiesLoading || membersLoading || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-64 text-gray-400">
                読み込み中...
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors">
            {/* sticky header */}
            <SettingsHeader title="赤ちゃん管理">
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
            </SettingsHeader>

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
