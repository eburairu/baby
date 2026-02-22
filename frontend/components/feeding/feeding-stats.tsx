import { Card, CardContent } from "@/components/ui/card";
import { FeedingSummary } from "@/types/feeding";
import { Clock, Baby } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { StatsBlock } from "@/components/ui/stats-block";

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
                    <StatsBlock
                        icon={Baby}
                        label="今日"
                        value={`${summary.today_count}回`}
                        color="rose"
                    >
                        <div className="text-[10px] text-gray-500 dark:text-zinc-500 space-y-0.5 mt-0.5">
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
                    </StatsBlock>

                    {/* 前回からの経過・次回ガイド */}
                    <StatsBlock
                        icon={Clock}
                        label="前回"
                        value={timeSinceLast}
                        color="rose"
                    >
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
                    </StatsBlock>
                </div>
            </CardContent>
        </Card>
    );
}
