import { Card, CardContent } from "@/components/ui/card";
import { FeedingSummary } from "@/types/feeding";
import { Clock, Milk, Baby } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface FeedingStatsProps {
    summary: FeedingSummary;
}

export function FeedingStats({ summary }: FeedingStatsProps) {
    const timeSinceLast = summary.last_feeding_time
        ? formatDistanceToNow(new Date(summary.last_feeding_time), {
            addSuffix: true,
            locale: ja,
        })
        : "記録なし";

    return (
        <Card className="mb-6 bg-gradient-to-br from-pink-50 to-orange-50 border-none shadow-sm">
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Baby className="w-4 h-4" /> 今日
                        </p>
                        <div className="text-2xl font-bold">{summary.today_count}回</div>
                        <div className="text-xs text-muted-foreground">
                            {summary.today_duration > 0 && <span>母乳 {summary.today_duration}分</span>}
                            {summary.today_duration > 0 && summary.today_amount > 0 && <span> / </span>}
                            {summary.today_amount > 0 && <span>ミルク {summary.today_amount}ml</span>}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-4 h-4" /> 前回
                        </p>
                        <div className="text-l font-bold text-wrap break-words">{timeSinceLast}</div>
                        <div className="text-xs text-muted-foreground">
                            {summary.last_feeding_type === "BREAST" && "母乳"}
                            {summary.last_feeding_type === "BOTTLE" && "ミルク"}
                            {summary.last_feeding_type === "MIXED" && "混合"}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
