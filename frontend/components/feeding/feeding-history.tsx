import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Feeding } from "@/types/feeding";
import { Trash2, Milk, Baby } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface FeedingHistoryProps {
    feedings: Feeding[];
    onDelete: (id: number) => Promise<void>;
}

export function FeedingHistory({ feedings, onDelete }: FeedingHistoryProps) {
    const handleDelete = async (id: number) => {
        if (confirm("この記録を削除しますか？")) {
            await onDelete(id);
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
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => handleDelete(feeding.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
