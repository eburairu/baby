import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Diaper, DiaperType } from "@/types/diaper"
import { isToday, formatElapsed } from "@/lib/ageUtils"

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
        <Card className="bg-white rounded-2xl shadow-sm border-0 mb-4">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
                    <span>今日の記録</span>
                    <span className="text-xs font-normal bg-gray-100 px-2 py-1 rounded-full">{totalCount}回</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-3">
                        <div className="text-sm text-blue-600 font-medium mb-1">おしっこ 💧</div>
                        <div className="text-2xl font-bold text-blue-700">{wetCount}<span className="text-sm font-normal ml-1">回</span></div>
                        <div className="text-xs text-blue-400 mt-1">
                            前回: {lastWet ? formatElapsed(lastWet.change_time) : 'なし'}
                        </div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3">
                        <div className="text-sm text-amber-600 font-medium mb-1">うんち 💩</div>
                        <div className="text-2xl font-bold text-amber-700">{dirtyCount}<span className="text-sm font-normal ml-1">回</span></div>
                        <div className="text-xs text-amber-400 mt-1">
                            前回: {lastDirty ? formatElapsed(lastDirty.change_time) : 'なし'}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
