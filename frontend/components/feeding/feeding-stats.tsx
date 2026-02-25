import { FeedingStatsResult } from "@/lib/feedingUtils";
import { Clock, Baby } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { StatsBlock } from "@/components/ui/stats-block";
import { StatsCard } from "@/components/ui/stats-card";

interface FeedingStatsProps {
    summary: FeedingStatsResult;
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
    const timeSinceLast = summary.lastFeedingTime
        ? formatDistanceToNow(new Date(summary.lastFeedingTime), {
            addSuffix: true,
            locale: ja,
        })
        : "記録なし";

    const hasLeftRight = summary.todayLeftDuration > 0 || summary.todayRightDuration > 0;

    return (
        <StatsCard>
            <div className="grid grid-cols-2 gap-4">
                {/* 今日のサマリー */}
                <StatsBlock
                    icon={Baby}
                    label="今日"
                    value={`${summary.todayCount}回`}
                    color="rose"
                >
                    <div className="text-[10px] text-gray-500 dark:text-zinc-500 space-y-0.5 mt-0.5">
                        {summary.todayDuration > 0 && (
                            <p>母乳 {summary.todayDuration}分</p>
                        )}
                        {hasLeftRight && (
                            <p className="text-rose-500 dark:text-rose-400">
                                └ 左{summary.todayLeftDuration}分 / 右{summary.todayRightDuration}分
                            </p>
                        )}
                        {summary.todayAmount > 0 && (
                            <p>ミルク {summary.todayAmount}ml</p>
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
                            {summary.lastFeedingType === "BREAST" ? "母乳" : null}
                            {summary.lastFeedingType === "BOTTLE" ? "ミルク" : null}
                            {summary.lastFeedingType === "MIXED" ? "混合" : null}
                            {summary.lastBreastSide && summary.lastFeedingType !== "BOTTLE" ? (
                                <span className="ml-1">({BREAST_SIDE_LABEL[summary.lastBreastSide]}から)</span>
                            ) : null}
                        </p>
                        {summary.lastBreastSide && summary.lastBreastSide !== "BOTH" && (
                            <p className="text-rose-500 dark:text-rose-400 font-medium">
                                💡 {NEXT_SIDE_GUIDE[summary.lastBreastSide]}
                            </p>
                        )}
                    </div>
                </StatsBlock>
            </div>
        </StatsCard>
    );
}
