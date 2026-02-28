import { AppIcons } from "@/constants/icons"
import { FeedingType } from "@/types/feeding"

interface FeedingIconProps {
    type: FeedingType
    className?: string
}

export function FeedingIcon({ type, className }: FeedingIconProps) {
    const isBreast = type === 'BREAST';
    const baseClasses = "p-2 rounded-full shrink-0";
    const colorClasses = isBreast
        ? "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
        : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";

    return (
        <div className={`${baseClasses} ${colorClasses} ${className || ''}`}>
            {isBreast ? <AppIcons.feedingBreast className="w-5 h-5" /> : <AppIcons.feedingBottle className="w-5 h-5" />}
        </div>
    );
}
