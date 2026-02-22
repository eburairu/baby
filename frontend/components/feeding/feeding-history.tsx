"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Feeding, FeedingCreate } from "@/types/feeding";
import { Trash2, Milk, Baby, User, MessageCircle, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useUser } from "@/hooks/useAuth";
import { RecordCommentDialog } from "@/components/records/RecordCommentDialog";
import { FeedingForm } from "./feeding-form";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface FeedingHistoryProps {
    feedings: Feeding[];
    onDelete: (id: number) => Promise<void>;
    onUpdate?: (id: number, data: Partial<FeedingCreate>) => Promise<Feeding | undefined>;
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
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [editTarget, setEditTarget] = useState<Feeding | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [commentTarget, setCommentTarget] = useState<{ id: number; title: string } | null>(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initialCommentRecordId && feedings.length > 0 && !initializedRef.current) {
            const target = feedings.find(f => f.id === initialCommentRecordId);
            if (target) {
                initializedRef.current = true;
                setCommentTarget({ id: target.id, title: `授乳 ${format(new Date(target.feeding_time), "HH:mm", { locale: ja })}` });
            }
        }
    }, [initialCommentRecordId, feedings]);

    const handleDelete = async () => {
        if (deleteTargetId === null) return;
        setIsDeleting(true);
        try {
            await onDelete(deleteTargetId);
            toast.success("削除しました");
            setDeleteTargetId(null);
        } catch (e) {
            console.error(e);
            toast.error("削除に失敗しました");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!feedings || feedings.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">最近の記録</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">まだ記録がありません。</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">最近の記録</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {feedings.map((feeding) => (
                        <div
                            key={feeding.id}
                            className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`p-2 rounded-full shrink-0 mt-0.5 ${feeding.feeding_type === 'BREAST' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {feeding.feeding_type === 'BREAST' ? <Baby className="w-5 h-5" /> : <Milk className="w-5 h-5" />}
                                </div>
                                <div className="space-y-1">
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
                                    <div className="flex items-center gap-2 flex-wrap">
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
                                </div>
                            </div>
                            {canWrite && (
                                <div className="flex items-center gap-1 shrink-0 ml-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-gray-400 hover:text-indigo-500"
                                        onClick={() => setEditTarget(feeding)}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-gray-400 hover:text-red-500"
                                        onClick={() => setDeleteTargetId(feeding.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* 削除確認ダイアログ */}
            <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => { if (!open) setDeleteTargetId(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle data-sentry-unmask>記録の削除</AlertDialogTitle>
                        <AlertDialogDescription data-sentry-unmask>
                            この授乳記録を削除しますか？この操作は取り消せません。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting} data-sentry-unmask>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} data-sentry-unmask className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            削除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* コメントダイアログ */}
            {commentTarget && (
                <RecordCommentDialog
                    open={commentTarget !== null}
                    onOpenChange={(open) => { if (!open) setCommentTarget(null) }}
                    recordType="feeding"
                    recordId={commentTarget.id}
                    title={commentTarget.title}
                    currentUserId={user?.id}
                    onCommentChange={onRefresh}
                />
            )}

            {/* 編集ダイアログ */}
            <Dialog open={editTarget !== null} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
                <DialogContent className="max-w-md p-0 overflow-hidden border-0 sm:border rounded-2xl">
                    <DialogHeader className="p-4 border-b bg-slate-50 dark:bg-zinc-900/50">
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <Pencil className="w-5 h-5 text-indigo-500" />
                            授乳記録の編集
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-4 max-h-[80vh] overflow-y-auto">
                        {editTarget && babyId && (
                            <FeedingForm
                                babyId={babyId}
                                initialData={editTarget}
                                onUpdate={onUpdate}
                                onSuccess={() => setEditTarget(null)}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
