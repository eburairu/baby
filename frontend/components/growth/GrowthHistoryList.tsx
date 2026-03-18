"use client"

import { MessageCircle } from "lucide-react"
import { api } from "@/lib/api"
import type { Growth } from "@/types/growth"
import { useRecordComments } from "@/hooks/useRecordComments"
import { useRecordDelete } from "@/hooks/useRecordDelete"
import { RecordActionButtons } from "@/components/records/RecordActionButtons"

interface GrowthHistoryListProps {
    records: Growth[]
    onEdit: (record: Growth) => void
    onDeleteSuccess: () => void
    canWrite?: boolean
    initialCommentRecordId?: number | null
}

export function GrowthHistoryList({
    records,
    onEdit,
    onDeleteSuccess,
    canWrite = true,
    initialCommentRecordId,
}: GrowthHistoryListProps) {
    const { setDeleteTargetId, ConfirmDeleteDialog } = useRecordDelete({
        onDelete: async (id) => {
            await api.delete(`/growths/${id}`)
        },
        onSuccess: onDeleteSuccess,
        resourceName: "成長記録"
    });

    const { openComment, CommentDialog } = useRecordComments({
        records: records,
        recordType: "growth",
        initialCommentRecordId,
        getTitle: (record) => `成長記録 ${record.date}`,
        onCommentChange: onDeleteSuccess
    });

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
                            <th className="text-left py-2 px-4 font-medium">記録者</th>
                            <th className="text-left py-2 px-4 font-medium"></th>
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
                                <td className="py-2 px-4 text-muted-foreground text-xs">
                                    {record.recorded_by_display_name ?? "-"}
                                </td>
                                <td className="py-2 px-4">
                                <button
                                    aria-label={`${record.date} の成長記録へのコメント${(record.comment_count ?? 0) > 0 ? ` (${record.comment_count}件)` : ""}`}
                                    title={`${record.date} の成長記録へのコメント${(record.comment_count ?? 0) > 0 ? ` (${record.comment_count}件)` : ""}`}
                                        onClick={() => openComment(record)}
                                    className="inline-flex items-center gap-0.5 text-xs text-gray-400 dark:text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 rounded-sm outline-none"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        {(record.comment_count ?? 0) > 0 && <span>{record.comment_count}</span>}
                                    </button>
                                </td>
                                {canWrite && (
                                    <td className="py-2 px-4">
                                        <RecordActionButtons
                                            canWrite={canWrite}
                                            onEdit={() => onEdit(record)}
                                            onDelete={() => setDeleteTargetId(record.id)}
                                            editLabel={`${record.date} の成長記録を編集`}
                                            deleteLabel={`${record.date} の成長記録を削除`}
                                        />
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* コメントダイアログ */}
            <CommentDialog />

            {/* 削除確認ダイアログ */}
            <ConfirmDeleteDialog />
        </>
    )
}
