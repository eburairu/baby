import { Card, CardContent } from "@/components/ui/card"
import { Diaper, DiaperType } from "@/types/diaper"
import { isToday, formatElapsed } from "@/lib/ageUtils"
import { Droplets, Trash2, Smile } from "lucide-react"

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

    const totalCount = todayDiapers.length

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
                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 flex items-center gap-3 transition-colors">
                        <div className="bg-white dark:bg-zinc-800 rounded-full p-2 shadow-sm transition-colors">
                            <Droplets className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-zinc-400">おしっこ</p>
                            <p className="text-lg font-bold text-gray-800 dark:text-zinc-100">{wetCount}回</p>
                            <p className="text-[10px] text-gray-500 dark:text-zinc-500">
                                {lastWet ? formatElapsed(lastWet.change_time) : 'なし'}
                            </p>
                        </div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 flex items-center gap-3 transition-colors">
                        <div className="bg-white dark:bg-zinc-800 rounded-full p-2 shadow-sm transition-colors">
                            <Trash2 className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-zinc-400">うんち</p>
                            <p className="text-lg font-bold text-gray-800 dark:text-zinc-100">{dirtyCount}回</p>
                            <p className="text-[10px] text-gray-500 dark:text-zinc-500">
                                {lastDirty ? formatElapsed(lastDirty.change_time) : 'なし'}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
