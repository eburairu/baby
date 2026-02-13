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
        <Card className="bg-white rounded-2xl shadow-sm border-0 mb-6">
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-rose-50 rounded-xl p-4 flex items-center gap-3">
                        <div className="bg-white rounded-full p-2 shadow-sm">
                            <Baby className="h-4 w-4 text-rose-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">今日</p>
                            <p className="text-lg font-bold text-gray-800">{summary.today_count}回</p>
                            <p className="text-[10px] text-gray-500">
                                {summary.today_duration > 0 && <span>母乳 {summary.today_duration}分</span>}
                                {summary.today_duration > 0 && summary.today_amount > 0 && <span> / </span>}
                                {summary.today_amount > 0 && <span>ミルク {summary.today_amount}ml</span>}
                            </p>
                        </div>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-4 flex items-center gap-3">
                        <div className="bg-white rounded-full p-2 shadow-sm">
                            <Clock className="h-4 w-4 text-rose-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500">前回</p>
                            <p className="text-lg font-bold text-gray-800 truncate">{timeSinceLast}</p>
                            <p className="text-[10px] text-gray-500">
                                {summary.last_feeding_type === "BREAST" && "母乳"}
                                {summary.last_feeding_type === "BOTTLE" && "ミルク"}
                                {summary.last_feeding_type === "MIXED" && "混合"}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
