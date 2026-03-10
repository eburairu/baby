import { AppIcons } from "@/constants/icons"
import { FeedingType } from "@/types/feeding"
import { Hexagon } from "@/components/ui/hexagon"
import { cn } from "@/lib/utils"

interface FeedingIconProps {
    type: FeedingType
    className?: string
}

export function FeedingIcon({ type, className }: FeedingIconProps) {
    const isBreast = type === 'BREAST';
    const bgClass = isBreast
        ? "text-pink-100 dark:text-pink-900/30"
        : "text-blue-100 dark:text-blue-900/30";
    const iconClass = isBreast
        ? "text-pink-600 dark:text-pink-400"
        : "text-blue-600 dark:text-blue-400";

    return (
        <Hexagon
            size={36}
            cornerRadius={6}
            className={cn("shrink-0", bgClass, className)}
        >
            {isBreast ? (
                <AppIcons.feedingBreast className={cn("w-4 h-4", iconClass)} />
            ) : (
                <AppIcons.feedingBottle className={cn("w-4 h-4", iconClass)} />
            )}
        </Hexagon>
    );
}
