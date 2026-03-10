import { Diaper } from "@/types/diaper"
import { StatsBlock } from "@/components/ui/stats-block"
import { calculateDiaperStats, normalizeDiaperFromEntity } from "@/lib/diaperUtils"
import { StatsCard } from "@/components/ui/stats-card"
import { AppIcons } from "@/constants/icons"

interface Props {
    diapers: Diaper[]
}

export function DiaperStats({ diapers }: Props) {
    const stats = calculateDiaperStats(
        diapers.map(normalizeDiaperFromEntity)
    )

    return (
        <StatsCard>
            <div className="grid grid-cols-2 gap-4">
                <StatsBlock
                    icon={AppIcons.diaperWet}
                    label="おしっこ"
                    value={`${stats.wetCount}回`}
                    color="amber"
                >
                    <p className="text-[10px] text-gray-500 dark:text-zinc-500">
                        {stats.lastWetElapsed ? stats.lastWetElapsed : 'なし'}
                    </p>
                </StatsBlock>
                <StatsBlock
                    icon={AppIcons.diaperDirty}
                    label="うんち"
                    value={`${stats.dirtyCount}回`}
                    color="amber"
                >
                        <p className="text-[10px] text-gray-500 dark:text-zinc-500">
                        {stats.lastDirtyElapsed ? stats.lastDirtyElapsed : 'なし'}
                    </p>
                </StatsBlock>
            </div>
        </StatsCard>
    )
}
