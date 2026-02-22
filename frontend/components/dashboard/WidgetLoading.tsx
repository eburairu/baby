import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"
import { cn } from "@/lib/utils"

interface WidgetLoadingProps {
    className?: string
}

export function WidgetLoading({ className }: WidgetLoadingProps) {
    return (
        <div className="flex justify-center py-4">
            <BabyBottleLoading className={cn("w-8 h-8", className)} />
        </div>
    )
}
