import { Feeding } from "@/types/feeding"
import { BOTTLE_CONTENT_LABEL } from "@/constants/feeding"

interface FeedingDetailsProps {
    feeding: Feeding
}

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

export function FeedingDetails({ feeding }: FeedingDetailsProps) {
    return (
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
    );
}
