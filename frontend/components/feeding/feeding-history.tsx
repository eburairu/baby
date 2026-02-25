"use client"
import { useState, useEffect, useRef } from "react"
import { Feeding, FeedingUpdate } from "@/types/feeding"
import { RECORD_TYPES } from "@/types/enums"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil, User, MessageCircle, Baby, Milk } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { useUser } from "@/hooks/useAuth"
import { RecordCommentDialog } from "@/components/records/RecordCommentDialog"
import { useRecordDelete } from "@/hooks/useRecordDelete"
import { HistoryCard } from "@/components/records/HistoryCard"
import { RecordListItem } from "@/components/records/RecordListItem"
import { RecordActionButtons } from "@/components/records/RecordActionButtons"
import { FeedingEditDialog } from "./FeedingEditDialog"

interface FeedingHistoryProps {
    feedings: Feeding[];
    onDelete: (id: number) => Promise<void>;
    onUpdate?: (id: number, data: FeedingUpdate) => Promise<Feeding | undefined>;
    onRefresh?: () => void;
    canWrite?: boolean;
    initialCommentRecordId?: number | null;
    babyId?: number;
}

const BOTTLE_CONTENT_LABEL: Record<string, string> = {
    FORMULA: "粉ミルク",
    EXPRESSED_MILK: "搾母乳",
    MIXED: "混合",
};

const COMPLETION_STYLE: Record<string, { label: string; className: string }> = {
    FULL: { label: "しっかり飲んだ", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    PARTIAL: { label: "途中でやめた", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

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
    const { user } = useUser();
    const [editTarget, setEditTarget] = useState<Feeding | null>(null);
    const [commentTarget, setCommentTarget] = useState<{ id: number; title: string } | null>(null);
    const initializedRef = useRef(false);

    const { setDeleteTargetId, ConfirmDeleteDialog } = useRecordDelete({
        onDelete,
        onSuccess: onRefresh,
        resourceName: "授乳記録"
    });

    useEffect(() => {
        if (initialCommentRecordId && feedings.length > 0 && !initializedRef.current) {
            const target = feedings.find(f => f.id === initialCommentRecordId);
            if (target) {
                initializedRef.current = true;
                setTimeout(() => {
                    setCommentTarget({ id: target.id, title: `授乳 ${format(new Date(target.feeding_time), "HH:mm", { locale: ja })}` });
                }, 0);
            }
        }
    }, [initialCommentRecordId, feedings]);

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
                            {format(new Date(feeding.feeding_time), "HH:mm", { locale: ja })}
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
                            {feeding.recorded_by_display_name && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-zinc-500">
                                    <User className="w-3 h-3" />
                                    {feeding.recorded_by_display_name}
                                </span>
                            )}
                            <button
                                onClick={() => setCommentTarget({ id: feeding.id, title: `授乳 ${format(new Date(feeding.feeding_time), "HH:mm", { locale: ja })}` })}
                                className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                            >
                                <MessageCircle className="w-3 h-3" />
                                {feeding.comment_count > 0 && <span>{feeding.comment_count}</span>}
                            </button>
                        </div>
                    </RecordListItem>
                ))}
            </HistoryCard>

            <ConfirmDeleteDialog />

            {/* コメントダイアログ */}
            {commentTarget && (
                <RecordCommentDialog
                    open={commentTarget !== null}
                    onOpenChange={(open) => { if (!open) setCommentTarget(null) }}
                    recordType={RECORD_TYPES.FEEDING}
                    recordId={commentTarget.id}
                    title={commentTarget.title}
                    currentUserId={user?.id}
                    onCommentChange={onRefresh}
                />
            )}

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
