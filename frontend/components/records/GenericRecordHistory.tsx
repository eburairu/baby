"use client"
import { useState, ReactNode } from "react"
import { useRecordDelete } from "@/hooks/useRecordDelete"
import { useRecordComments } from "@/hooks/useRecordComments"
import { HistoryCard } from "@/components/records/HistoryCard"
import { RecordListItem } from "@/components/records/RecordListItem"
import { RecordActionButtons } from "@/components/records/RecordActionButtons"
import { RecordMetaItems } from "@/components/records/RecordMetaItems"

/**
 * 記録リソースの履歴表示を共通化する汎用コンポーネント
 */
interface GenericRecordHistoryProps<T extends { id: number; recorded_by_display_name?: string | null; comment_count: number }> {
    title?: string;
    records: T[];
    recordType: string;
    resourceName: string;
    canWrite?: boolean;
    initialCommentRecordId?: number | null;
    onRefresh: () => void;
    onDelete: (id: number) => Promise<void>;
    renderIcon: (record: T) => ReactNode;
    renderTitle: (record: T) => ReactNode;
    renderDetails?: (record: T) => ReactNode;
    renderMetaExtra?: (record: T) => ReactNode;
    renderEditDialog: (record: T | null, open: boolean, setOpen: (open: boolean) => void) => ReactNode;
    getCommentTitle: (record: T) => string;
    className?: string;
    itemClassName?: (record: T) => string;
}

export function GenericRecordHistory<T extends { id: number; recorded_by_display_name?: string | null; comment_count: number }>({
    title = "最近の記録",
    records,
    recordType,
    resourceName,
    canWrite = true,
    initialCommentRecordId,
    onRefresh,
    onDelete,
    renderIcon,
    renderTitle,
    renderDetails,
    renderMetaExtra,
    renderEditDialog,
    getCommentTitle,
    className,
    itemClassName,
}: GenericRecordHistoryProps<T>) {
    const [editTarget, setEditTarget] = useState<T | null>(null);

    const { setDeleteTargetId, ConfirmDeleteDialog } = useRecordDelete({
        onDelete,
        onSuccess: onRefresh,
        resourceName
    });

    const { openComment, CommentDialog } = useRecordComments({
        records,
        recordType,
        initialCommentRecordId,
        getTitle: getCommentTitle,
        onCommentChange: onRefresh
    });

    const isEmpty = !records || records.length === 0;

    return (
        <div className={className}>
            <HistoryCard title={title} isEmpty={isEmpty} emptyMessage={`${resourceName}がまだありません。`}>
                {(records || []).map((record) => (
                    <RecordListItem
                        key={record.id}
                        icon={renderIcon(record)}
                        className={itemClassName?.(record)}
                        actions={
                            <RecordActionButtons
                                canWrite={canWrite}
                                onEdit={() => setEditTarget(record)}
                                onDelete={() => setDeleteTargetId(record.id)}
                            />
                        }
                    >
                        {renderTitle(record)}
                        {renderDetails?.(record)}
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                            {renderMetaExtra?.(record)}
                            <RecordMetaItems
                                displayName={record.recorded_by_display_name}
                                commentCount={record.comment_count}
                                onCommentClick={() => openComment(record)}
                                className="mt-0"
                            />
                        </div>
                    </RecordListItem>
                ))}
            </HistoryCard>

            <ConfirmDeleteDialog />
            <CommentDialog />
            {renderEditDialog(editTarget, editTarget !== null, (open) => { if (!open) setEditTarget(null) })}
        </div>
    );
}
