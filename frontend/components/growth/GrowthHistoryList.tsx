"use client"

import { useState } from "react"
import { Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
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
import type { Growth } from "@/types/growth"

interface GrowthHistoryListProps {
    records: Growth[]
    onEdit: (record: Growth) => void
    onDeleteSuccess: () => void
    canWrite?: boolean
}

export function GrowthHistoryList({
    records,
    onEdit,
    onDeleteSuccess,
    canWrite = true,
}: GrowthHistoryListProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!deleteId) return
        setIsDeleting(true)
        try {
            await api.delete(`/growths/${deleteId}`)
            onDeleteSuccess()
        } catch (error) {
            console.error("Failed to delete growth record:", error)
        } finally {
            setIsDeleting(false)
            setDeleteId(null)
        }
    }

    if (records.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                記録がまだありません
            </div>
        )
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-2 px-4 font-medium">日付</th>
                            <th className="text-right py-2 px-4 font-medium">身長 (cm)</th>
                            <th className="text-right py-2 px-4 font-medium">体重 (g)</th>
                            <th className="text-right py-2 px-4 font-medium">頭囲 (cm)</th>
                            {canWrite && <th className="text-left py-2 px-4 font-medium">操作</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record) => (
                            <tr key={record.id} className="border-b hover:bg-accent/50 transition-colors">
                                <td className="py-2 px-4">{record.date}</td>
                                <td className="py-2 px-4 text-right">
                                    {record.height ? `${record.height.toFixed(1)} cm` : "-"}
                                </td>
                                <td className="py-2 px-4 text-right">
                                    {record.weight ? `${record.weight} g` : "-"}
                                </td>
                                <td className="py-2 px-4 text-right">
                                    {record.head_circumference ? `${record.head_circumference.toFixed(1)} cm` : "-"}
                                </td>
                                {canWrite && (
                                    <td className="py-2 px-4">
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => onEdit(record)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setDeleteId(record.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>記録を削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                            この操作は取り消せません。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            削除する
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
