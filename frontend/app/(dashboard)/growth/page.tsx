"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useGrowths, useBabies } from "@/hooks/useData"
import { usePermissions } from "@/hooks/usePermissions"
import { useBabyStore } from "@/stores/babyStore"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { GrowthChart } from "@/components/growth/GrowthChart"
import { GrowthHistoryList } from "@/components/growth/GrowthHistoryList"
import { GrowthRecordForm } from "@/components/growth/GrowthRecordForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageLoading } from "@/components/ui/page-loading"
import { AccessDenied } from "@/components/ui/access-denied"
import { TrendingUp } from "lucide-react"
import Link from "next/link"
import { Growth } from "@/types/growth"
import { isApiError } from "@/lib/api"

export default function GrowthPage() {
    const searchParams = useSearchParams()
    const paramBabyId = searchParams.get("baby_id")
    const { canWrite } = usePermissions()
    const { babies } = useBabies()
    const { selectedBabyId } = useBabyStore()

    // Priority: URL param > store selection > first baby
    const babyId = paramBabyId ?? selectedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)
    const { growths, isLoading, isError: growthError, mutate } = useGrowths(babyId)

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingRecord, setEditingRecord] = useState<Growth | null>(null)

    const handleEdit = (record: Growth) => {
        setEditingRecord(record)
        setIsFormOpen(true)
    }

    const handleAdd = () => {
        setEditingRecord(null)
        setIsFormOpen(true)
    }

    if (isLoading) return <PageLoading />

    if (!babyId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">赤ちゃんが選択されていません</p>
            </div>
        )
    }

    const isAccessDenied = isApiError(growthError) && growthError.status === 403

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
                <div className="flex items-center justify-center h-14 px-4 max-w-2xl mx-auto">
                    <h1 className="text-base font-semibold text-gray-800 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        成長記録
                    </h1>
                </div>
            </header>

            <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
                {isAccessDenied ? (
                    <AccessDenied />
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">数値の推移</h2>
                            {canWrite && (
                                <Button onClick={handleAdd} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                                    <Plus className="h-4 w-4" />
                                    新しい記録
                                </Button>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
                        ) : (
                            <>
                                <GrowthChart
                                    records={growths || []}
                                    babyBirthday={babies?.find(b => String(b.id) === babyId)?.birthday}
                                    babyGender={babies?.find(b => String(b.id) === babyId)?.gender}
                                />

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">履歴</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <GrowthHistoryList
                                            records={growths || []}
                                            onEdit={handleEdit}
                                            onDeleteSuccess={() => mutate()}
                                            canWrite={canWrite}
                                        />
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        <GrowthRecordForm
                            babyId={parseInt(babyId)}
                            record={editingRecord}
                            isOpen={isFormOpen}
                            onClose={() => setIsFormOpen(false)}
                            onSuccess={() => mutate()}
                        />
                    </>
                )}
            </main>
        </div>
    )
}
