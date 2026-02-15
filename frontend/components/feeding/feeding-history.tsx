"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Feeding } from "@/types/feeding";
import { Trash2, Milk, Baby } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
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

interface FeedingHistoryProps {
    feedings: Feeding[];
    onDelete: (id: number) => Promise<void>;
    canWrite?: boolean;
}

export function FeedingHistory({ feedings, onDelete, canWrite = true }: FeedingHistoryProps) {
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    const handleDelete = async () => {
        if (deleteTargetId === null) return;
        try {
            await onDelete(deleteTargetId);
        } finally {
            setDeleteTargetId(null);
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
                            className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-full ${feeding.feeding_type === 'BREAST' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {feeding.feeding_type === 'BREAST' ? <Baby className="w-5 h-5" /> : <Milk className="w-5 h-5" />}
                                </div>
                                <div>
                                    <div className="font-medium">
                                        {format(new Date(feeding.feeding_time), "HH:mm", { locale: ja })}
                                        <span className="ml-2 text-sm text-muted-foreground">
                                            {feeding.feeding_type === 'BREAST' ? '母乳' : feeding.feeding_type === 'BOTTLE' ? 'ミルク' : '混合'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {feeding.feeding_type === 'BREAST' && feeding.duration_minutes && `${feeding.duration_minutes}分`}
                                        {feeding.feeding_type === 'BOTTLE' && feeding.amount_ml && `${feeding.amount_ml}ml`}
                                        {feeding.notes && <span className="ml-2 text-xs text-gray-400">({feeding.notes})</span>}
                                    </div>
                                </div>
                            </div>
                            {canWrite && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-400 hover:text-red-500"
                                    onClick={() => setDeleteTargetId(feeding.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* 削除確認ダイアログ */}
            <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => { if (!open) setDeleteTargetId(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>記録の削除</AlertDialogTitle>
                        <AlertDialogDescription>
                            この授乳記録を削除しますか？この操作は取り消せません。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            削除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
