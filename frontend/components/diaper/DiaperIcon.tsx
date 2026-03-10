import { AppIcons } from "@/constants/icons"
import { DiaperType } from "@/types/diaper"

interface DiaperIconProps {
    type: DiaperType
}

export function DiaperIcon({ type }: DiaperIconProps) {
    switch (type) {
        case DiaperType.WET:
            return <AppIcons.diaperWet className="w-6 h-6" />;
        case DiaperType.DIRTY:
            return <AppIcons.diaperDirty className="w-6 h-6" />;
        case DiaperType.BOTH:
            return <span className="flex gap-0.5"><AppIcons.diaperWet className="w-6 h-6" /><AppIcons.diaperDirty className="w-6 h-6" /></span>;
        default:
            return <span>?</span>;
    }
}
