"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/useAuth"
import { useBabies } from "@/hooks/useData"
import { usePermissions } from "@/hooks/usePermissions"
import { BabyCard } from "@/components/settings/BabyCard"
import { BabyEditDialog } from "@/components/settings/BabyEditDialog"
import { AddBabyDialog } from "@/components/settings/AddBabyDialog"
import { BabyDeleteDialog } from "@/components/settings/BabyDeleteDialog"
import { Baby } from "@/types/baby"
import { SettingsHeader } from "@/components/settings/SettingsHeader"
import { PullToRefresh } from "@/components/ui/pull-to-refresh"

export default function BabySettingsPage() {
    const { user } = useUser()
    const { babies, isLoading: babiesLoading, mutate } = useBabies()
    const { isAdmin, isLoading: permsLoading } = usePermissions()
    const router = useRouter()

    const [editTarget, setEditTarget] = useState<Baby | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Baby | null>(null)
    const [addOpen, setAddOpen] = useState(false)

    // 管理者以外はリダイレクト (正確な判定に基づい た修正済みの usePermissions を使用)
    useEffect(() => {
        if (!permsLoading && !isAdmin && !user?.is_superadmin) {
            router.push("/dashboard")
        }
    }, [permsLoading, isAdmin, user, router])

    if (permsLoading || babiesLoading) {
        return (
            <div className="flex items-center justify-center min-h-64 text-gray-400">
                読み込み中...
            </div>
        )
    }

    const canManage = isAdmin || user?.is_superadmin

    if (!user || !canManage) return null

    const handleRefresh = async () => {
        await mutate()
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors">
            {/* sticky header */}
            <SettingsHeader title="赤ちゃん管理">
                {canManage && (
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

            <PullToRefresh onRefresh={handleRefresh}>
                <div className="max-w-2xl mx-auto p-4 space-y-4 pb-20">
                    {!babies || babies.length === 0 ? (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-8 text-center transition-colors">
                            <p className="text-gray-400 dark:text-zinc-500 text-sm mb-4">👶 まだ赤ちゃんが登 録されていません</p>
                            {canManage && (
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
                                isAdmin={Boolean(canManage)}
                                onEdit={setEditTarget}
                                onDelete={setDeleteTarget}
                            />
                        ))
                    )}
                </div>
            </PullToRefresh>

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
