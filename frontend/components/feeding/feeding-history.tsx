"use client"
import { useState } from "react"
import { Feeding, FeedingUpdate } from "@/types/feeding"
import { RECORD_TYPES } from "@/types/enums"
import { RecordMetaItems } from "@/components/records/RecordMetaItems"
import { formatTime } from "@/lib/dateUtils"

import { useRecordDelete } from "@/hooks/useRecordDelete"
import { HistoryCard } from "@/components/records/HistoryCard"
import { RecordListItem } from "@/components/records/RecordListItem"
import { RecordActionButtons } from "@/components/records/RecordActionButtons"
import { FeedingEditDialog } from "./FeedingEditDialog"
import { useRecordComments } from "@/hooks/useRecordComments"
import { COMPLETION_STYLE, FEEDING_TYPE_LABELS } from "@/constants/feeding"
import { FeedingIcon } from "./FeedingIcon"
import { FeedingDetails } from "./FeedingDetails"

interface FeedingHistoryProps {
    feedings: Feeding[];
    onDelete: (id: number) => Promise<void>;
    onUpdate?: (id: number, data: FeedingUpdate) => Promise<Feeding | undefined>;
    onRefresh?: () => void;
    canWrite?: boolean;
    initialCommentRecordId?: number | null;
    babyId?: number;
}

export function FeedingHistory({ feedings, onDelete, onUpdate, onRefresh, canWrite = true, initialCommentRecordId, babyId }: FeedingHistoryProps) {
    const [editTarget, setEditTarget] = useState<Feeding | null>(null);

    const { setDeleteTargetId, ConfirmDeleteDialog } = useRecordDelete({
        onDelete,
        onSuccess: onRefresh,
        resourceName: "授乳記録"
    });

    const { openComment, CommentDialog } = useRecordComments({
        records: feedings,
        recordType: RECORD_TYPES.FEEDING,
        initialCommentRecordId,
        getTitle: (record) => `授乳 ${formatTime(record.feeding_time)}`,
        onCommentChange: onRefresh
    });

    const isEmpty = !feedings || feedings.length === 0;

    return (
        <>
            <HistoryCard title="最近の記録" isEmpty={isEmpty} emptyMessage="まだ記録がありません。">
                {(feedings || []).map((feeding) => (
                    <RecordListItem
                        key={feeding.id}
                        icon={<FeedingIcon type={feeding.feeding_type} />}
                        actions={
                            <RecordActionButtons
                                canWrite={canWrite}
                                onEdit={() => setEditTarget(feeding)}
                                onDelete={() => setDeleteTargetId(feeding.id)}
                            />
                        }
                    >
                        <div className="font-medium">
                            {formatTime(feeding.feeding_time)}
                            <span className="ml-2 text-sm text-muted-foreground">
                                {FEEDING_TYPE_LABELS[feeding.feeding_type] || feeding.feeding_type}
                            </span>
                        </div>
                        <FeedingDetails feeding={feeding} />
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                            {feeding.feeding_completion && (
                                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${COMPLETION_STYLE[feeding.feeding_completion].className}`}>
                                    {COMPLETION_STYLE[feeding.feeding_completion].label}
                                </span>
                            )}
                            <RecordMetaItems
                                displayName={feeding.recorded_by_display_name}
                                commentCount={feeding.comment_count}
                                onCommentClick={() => openComment(feeding)}
                                className="mt-0"
                            />
                        </div>
                    </RecordListItem>
                ))}
            </HistoryCard>

            <ConfirmDeleteDialog />

            {/* コメントダイアログ */}
            <CommentDialog />

            {/* 編集ダイアログ */}
            <FeedingEditDialog
                feeding={editTarget}
                open={editTarget !== null}
                onOpenChange={(open) => { if (!open) setEditTarget(null) }}
                babyId={babyId}
                onUpdate={onUpdate}
                onSuccess={() => setEditTarget(null)}
            />
        </>
    );
}
