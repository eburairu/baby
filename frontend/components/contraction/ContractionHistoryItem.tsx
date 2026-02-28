"use client"

import { formatSecondsToJapanese } from "@/lib/ageUtils"
import { formatTime } from "@/lib/dateUtils"
import { ContractionRecord } from "@/types/contraction"
import { RecordActionButtons } from "@/components/records/RecordActionButtons"
import { RecordMetaItems } from "@/components/records/RecordMetaItems"
import { RecordListItem } from "@/components/records/RecordListItem"

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
        <RecordListItem
            className="border-0 rounded-none border-b last:border-0 hover:bg-muted/50 p-4"
            actions={
                <RecordActionButtons
                    canWrite={canWrite}
                    onEdit={() => onEdit(record)}
                    onDelete={() => onDelete(record.id)}
                />
            }
        >
            <div className="flex flex-col gap-1">
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
                    </div>
                </div>
                <RecordMetaItems
                    displayName={record.recorded_by_display_name}
                    commentCount={record.comment_count}
                    onCommentClick={() => onComment(record)}
                    className="ml-[4.5rem]"
                />
            </div>
        </RecordListItem>
    )
}
