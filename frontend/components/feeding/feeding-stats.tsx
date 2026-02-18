import { Card, CardContent } from "@/components/ui/card";
import { FeedingSummary } from "@/types/feeding";
import { Clock, Baby } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface FeedingStatsProps {
    summary: FeedingSummary;
}

const BREAST_SIDE_LABEL: Record<string, string> = {
    LEFT: "左",
    RIGHT: "右",
    BOTH: "両方",
};

const NEXT_SIDE_GUIDE: Record<string, string> = {
    LEFT: "次回は右から始めましょう",
    RIGHT: "次回は左から始めましょう",
    BOTH: "次回はどちらからでも大丈夫です",
};

export function FeedingStats({ summary }: FeedingStatsProps) {
    const timeSinceLast = summary.last_feeding_time
        ? formatDistanceToNow(new Date(summary.last_feeding_time), {
            addSuffix: true,
            locale: ja,
        })
        : "記録なし";

    const hasLeftRight = summary.today_left_duration > 0 || summary.today_right_duration > 0;

    return (
        <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 mb-6 transition-colors">
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                    {/* 今日のサマリー */}
                    <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-4 flex items-start gap-3">
                        <div className="bg-white dark:bg-zinc-800 rounded-full p-2 shadow-sm transition-colors shrink-0 mt-0.5">
                            <Baby className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 dark:text-zinc-400">今日</p>
                            <p className="text-lg font-bold text-gray-800 dark:text-zinc-100">{summary.today_count}回</p>
                            <div className="text-[10px] text-gray-500 dark:text-zinc-500 space-y-0.5">
                                {summary.today_duration > 0 && (
                                    <p>母乳 {summary.today_duration}分</p>
                                )}
                                {hasLeftRight && (
                                    <p className="text-rose-500 dark:text-rose-400">
                                        └ 左{summary.today_left_duration}分 / 右{summary.today_right_duration}分
                                    </p>
                                )}
                                {summary.today_amount > 0 && (
                                    <p>ミルク {summary.today_amount}ml</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 前回からの経過・次回ガイド */}
                    <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-4 flex items-start gap-3">
                        <div className="bg-white dark:bg-zinc-800 rounded-full p-2 shadow-sm transition-colors shrink-0 mt-0.5">
                            <Clock className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500 dark:text-zinc-400">前回</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-zinc-100 truncate">{timeSinceLast}</p>
                            <div className="text-[10px] text-gray-500 dark:text-zinc-500 space-y-0.5 mt-0.5">
                                <p>
                                    {summary.last_feeding_type === "BREAST" ? "母乳" : null}
                                    {summary.last_feeding_type === "BOTTLE" ? "ミルク" : null}
                                    {summary.last_feeding_type === "MIXED" ? "混合" : null}
                                    {summary.last_breast_side && summary.last_feeding_type !== "BOTTLE" ? (
                                        <span className="ml-1">({BREAST_SIDE_LABEL[summary.last_breast_side]}から)</span>
                                    ) : null}
                                </p>
                                {summary.last_breast_side && summary.last_breast_side !== "BOTH" && (
                                    <p className="text-rose-500 dark:text-rose-400 font-medium">
                                        💡 {NEXT_SIDE_GUIDE[summary.last_breast_side]}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
