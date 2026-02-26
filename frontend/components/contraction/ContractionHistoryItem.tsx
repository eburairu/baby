"use client"

import { formatSecondsToJapanese } from "@/lib/ageUtils"
import { formatTime } from "@/lib/dateUtils"
import { Button } from "@/components/ui/button"
import { ContractionRecord } from "@/types/contraction"
import { Pencil, Trash2, User, MessageCircle } from "lucide-react"

interface ContractionHistoryItemProps {
    record: ContractionRecord
    canWrite: boolean
    onEdit: (record: ContractionRecord) => void
    onDelete: (id: number) => void
    onComment: (record: ContractionRecord) => void
}

export function ContractionHistoryItem({
    record,
    canWrite,
    onEdit,
    onDelete,
    onComment
}: ContractionHistoryItemProps) {
    return (
        <div className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-14">
                    {formatTime(record.start_time)}
                </span>
                <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-muted-foreground">
                    {record.duration_seconds != null && (
                        <span>
                            持続: <span className="font-medium text-foreground">{formatSecondsToJapanese(record.duration_seconds)}</span>
                        </span>
                    )}
                    {record.interval_seconds != null && (
                        <span>
                            間隔: <span className="font-medium text-foreground">{formatSecondsToJapanese(record.interval_seconds)}</span>
                        </span>
                    )}
                    {record.recorded_by_display_name && (
                        <span className="inline-flex items-center gap-0.5 text-xs">
                            <User className="w-3 h-3" />
                            {record.recorded_by_display_name}
                        </span>
                    )}
                    <button
                        onClick={() => onComment(record)}
                        className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-indigo-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm p-0.5"
                        aria-label={(record.comment_count ?? 0) > 0 ? `${record.comment_count}件のコメントを表示` : "コメントを追加"}
                    >
                        <MessageCircle className="w-3 h-3" aria-hidden="true" />
                        {(record.comment_count ?? 0) > 0 && <span>{record.comment_count}</span>}
                    </button>
                </div>
            </div>
            {canWrite && (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary h-8 w-8 p-0"
                        onClick={() => onEdit(record)}
                        aria-label="編集"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                        onClick={() => onDelete(record.id)}
                        aria-label="削除"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}
