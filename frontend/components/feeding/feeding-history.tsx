"use client"
import { Feeding, FeedingUpdate } from "@/types/feeding"
import { RECORD_TYPES } from "@/types/enums"
import { formatDateTime } from "@/lib/dateUtils"
import { GenericRecordHistory } from "@/components/records/GenericRecordHistory"
import { FeedingEditDialog } from "./FeedingEditDialog"
import { COMPLETION_STYLE, FEEDING_TYPE_LABELS } from "@/constants/feeding"
import { FeedingIcon } from "./FeedingIcon"
import { FeedingDetails } from "./FeedingDetails"

/**
 * 授乳記録の履歴表示コンポーネント
 */
interface FeedingHistoryProps {
    feedings: Feeding[];
    onDelete: (id: number) => Promise<void>;
    onUpdate?: (id: number, data: FeedingUpdate) => Promise<Feeding | undefined>;
    onRefresh?: () => void;
    canWrite?: boolean;
    initialCommentRecordId?: number | null;
    babyId?: number;
}

export function FeedingHistory({ 
    feedings, 
    onDelete, 
    onUpdate, 
    onRefresh, 
    canWrite = true, 
    initialCommentRecordId, 
    babyId 
}: FeedingHistoryProps) {
    return (
        <GenericRecordHistory<Feeding>
            records={feedings}
            recordType={RECORD_TYPES.FEEDING}
            resourceName="授乳記録"
            canWrite={canWrite}
            initialCommentRecordId={initialCommentRecordId}
            onRefresh={onRefresh || (() => {})}
            onDelete={onDelete}
            getCommentTitle={(record) => `授乳 ${formatDateTime(record.feeding_time)}`}
            renderIcon={(record) => <FeedingIcon type={record.feeding_type} />}
            renderTitle={(record) => (
                <div className="font-medium">
                    {formatDateTime(record.feeding_time)}
                    <span className="ml-2 text-sm text-muted-foreground">
                        {FEEDING_TYPE_LABELS[record.feeding_type] || record.feeding_type}
                    </span>
                </div>
            )}
            renderDetails={(record) => <FeedingDetails feeding={record} />}
            renderMetaExtra={(record) => record.feeding_completion && (
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${COMPLETION_STYLE[record.feeding_completion].className}`}>
                    {COMPLETION_STYLE[record.feeding_completion].label}
                </span>
            )}
            renderEditDialog={(target, open, setOpen) => (
                <FeedingEditDialog
                    feeding={target}
                    open={open}
                    onOpenChange={setOpen}
                    babyId={babyId}
                    onUpdate={onUpdate}
                    onSuccess={() => setOpen(false)}
                />
            )}
        />
    );
}
