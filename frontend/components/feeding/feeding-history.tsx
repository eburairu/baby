"use client"
import { useState } from "react"
import { Feeding, FeedingUpdate } from "@/types/feeding"
import { RECORD_TYPES } from "@/types/enums"
import { Baby, Milk } from "lucide-react"
import { RecordMetaItems } from "@/components/records/RecordMetaItems"
import { formatTime } from "@/lib/dateUtils"

import { useRecordDelete } from "@/hooks/useRecordDelete"
import { HistoryCard } from "@/components/records/HistoryCard"
import { RecordListItem } from "@/components/records/RecordListItem"
import { RecordActionButtons } from "@/components/records/RecordActionButtons"
import { FeedingEditDialog } from "./FeedingEditDialog"
import { useRecordComments } from "@/hooks/useRecordComments"
import { BOTTLE_CONTENT_LABEL, COMPLETION_STYLE } from "@/constants/feeding"

interface FeedingHistoryProps {
    feedings: Feeding[];
    onDelete: (id: number) => Promise<void>;
    onUpdate?: (id: number, data: FeedingUpdate) => Promise<Feeding | undefined>;
    onRefresh?: () => void;
    canWrite?: boolean;
    initialCommentRecordId?: number | null;
    babyId?: number;
}

function BreastDuration({ feeding }: { feeding: Feeding }) {
    const { left_breast_minutes, right_breast_minutes, duration_minutes } = feeding;
    const hasLeftRight = left_breast_minutes != null || right_breast_minutes != null;

    if (hasLeftRight) {
        const left = left_breast_minutes ?? 0;
        const right = right_breast_minutes ?? 0;
        const total = left + right;
        if (left > 0 && right > 0) {
            return <span>左: {left}分 / 右: {right}分 (合計{total}分)</span>;
        }
        if (left > 0) return <span>左: {left}分</span>;
        if (right > 0) return <span>右: {right}分</span>;
    }
    if (duration_minutes) return <span>{duration_minutes}分</span>;
    return null;
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
                        icon={
                            <div className={`p-2 rounded-full shrink-0 ${feeding.feeding_type === 'BREAST' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                {feeding.feeding_type === 'BREAST' ? <Baby className="w-5 h-5" /> : <Milk className="w-5 h-5" />}
                            </div>
                        }
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
                                {feeding.feeding_type === 'BREAST' ? '母乳' : feeding.feeding_type === 'BOTTLE' ? 'ミルク' : '混合'}
                            </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-zinc-400">
                            {feeding.feeding_type === 'BREAST' && <BreastDuration feeding={feeding} />}
                            {feeding.feeding_type === 'BOTTLE' && feeding.amount_ml && (
                                <span>
                                    {feeding.amount_ml}ml
                                    {feeding.bottle_content_type && (
                                        <span className="ml-1 text-xs text-gray-400">
                                            ({BOTTLE_CONTENT_LABEL[feeding.bottle_content_type]})
                                        </span>
                                    )}
                                </span>
                            )}
                            {feeding.notes && (
                                <span className="ml-2 text-xs text-gray-400">({feeding.notes})</span>
                            )}
                        </div>
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
