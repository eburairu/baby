"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useGrowths } from "@/hooks/useData"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { GrowthChart } from "@/components/growth/GrowthChart"
import { GrowthHistoryList } from "@/components/growth/GrowthHistoryList"
import { GrowthRecordForm } from "@/components/growth/GrowthRecordForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function GrowthPage() {
    const searchParams = useSearchParams()
    const babyId = searchParams.get("baby_id")
    const { growths, isLoading, mutate } = useGrowths(babyId)

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingRecord, setEditingRecord] = useState<any>(null)

    const handleEdit = (record: any) => {
        setEditingRecord(record)
        setIsFormOpen(true)
    }

    const handleAdd = () => {
        setEditingRecord(null)
        setIsFormOpen(true)
    }

    if (!babyId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">赤ちゃんが選択されていません</p>
            </div>
        )
    }

    return (
        <div className="container max-w-4xl mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">成長記録</h1>
                <Button onClick={handleAdd} className="gap-2">
                    <Plus className="h-4 w-4" />
                    新しい記録
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
            ) : (
                <>
                    <GrowthChart records={growths || []} />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">履歴</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GrowthHistoryList
                                records={growths || []}
                                onEdit={handleEdit}
                                onDeleteSuccess={() => mutate()}
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
        </div>
    )
}
