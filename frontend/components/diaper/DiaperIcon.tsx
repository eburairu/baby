import { Droplets, Biohazard } from "lucide-react"
import { DiaperType } from "@/types/diaper"

interface DiaperIconProps {
    type: DiaperType
}

export function DiaperIcon({ type }: DiaperIconProps) {
    switch (type) {
        case DiaperType.WET:
            return <Droplets className="w-6 h-6" />;
        case DiaperType.DIRTY:
            return <Biohazard className="w-6 h-6" />;
        case DiaperType.BOTH:
            return <span className="flex gap-0.5"><Droplets className="w-6 h-6" /><Biohazard className="w-6 h-6" /></span>;
        default:
            return <span>?</span>;
    }
}
