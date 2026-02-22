import { Card, CardContent } from "@/components/ui/card"
import { Diaper, DiaperType } from "@/types/diaper"
import { isToday, formatElapsed } from "@/lib/ageUtils"
import { Droplets, Trash2 } from "lucide-react"
import { StatsBlock } from "@/components/ui/stats-block"

interface Props {
    diapers: Diaper[]
}

export function DiaperStats({ diapers }: Props) {
    // Current day stats
    const todayDiapers = diapers.filter((d) => isToday(d.change_time))

    const wetCount = todayDiapers.filter(
        (d) => d.diaper_type === DiaperType.WET || d.diaper_type === DiaperType.BOTH
    ).length

    const dirtyCount = todayDiapers.filter(
        (d) => d.diaper_type === DiaperType.DIRTY || d.diaper_type === DiaperType.BOTH
    ).length

    // Last record time
    const lastWet = diapers.find(
        (d) => d.diaper_type === DiaperType.WET || d.diaper_type === DiaperType.BOTH
    )
    const lastDirty = diapers.find(
        (d) => d.diaper_type === DiaperType.DIRTY || d.diaper_type === DiaperType.BOTH
    )

    return (
        <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 mb-6 transition-colors">
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                    <StatsBlock
                        icon={Droplets}
                        label="おしっこ"
                        value={`${wetCount}回`}
                        color="amber"
                    >
                        <p className="text-[10px] text-gray-500 dark:text-zinc-500">
                            {lastWet ? formatElapsed(lastWet.change_time) : 'なし'}
                        </p>
                    </StatsBlock>
                    <StatsBlock
                        icon={Trash2}
                        label="うんち"
                        value={`${dirtyCount}回`}
                        color="amber"
                    >
                         <p className="text-[10px] text-gray-500 dark:text-zinc-500">
                            {lastDirty ? formatElapsed(lastDirty.change_time) : 'なし'}
                        </p>
                    </StatsBlock>
                </div>
            </CardContent>
        </Card>
    )
}
