"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/usePermissions"
import { api, isApiError } from "@/lib/api"
import { formatElapsed, isToday } from "@/lib/ageUtils"
import Link from "next/link"
import { ArrowRight, ShieldOff } from "lucide-react"
import { DiaperType } from "@/types/diaper"
import { BabyRecord } from "@/hooks/useData"

interface Props {
    babyId: string
    records?: BabyRecord[]
    isError?: any
    mutate?: () => void
}

export function DiaperWidget({ babyId, records, isError, mutate }: Props) {
    const { canWrite } = usePermissions()
    const [loading, setLoading] = useState(false)

    const isAccessDenied = isApiError(isError) && isError.status === 403

    if (isAccessDenied) {
        return (
            <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 opacity-60 transition-colors">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-400 dark:text-zinc-500 flex items-center gap-1">
                        👶 おむつ
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                    <ShieldOff className="h-6 w-6 text-gray-300 dark:text-zinc-700 mb-1" />
                    <p className="text-[10px] text-gray-400 dark:text-zinc-600">閲覧制限中</p>
                </CardContent>
            </Card>
        )
    }

    const diaperRecords = records?.filter(r => r.type === 'diaper') ?? []
    const todayDiapers = diaperRecords.filter((d) => isToday(d.timestamp))
    const wetCount = todayDiapers.filter((d) => d.details.diaper_type === DiaperType.WET || d.details.diaper_type === DiaperType.BOTH).length
    const dirtyCount = todayDiapers.filter((d) => d.details.diaper_type === DiaperType.DIRTY || d.details.diaper_type === DiaperType.BOTH).length

    const lastDiaper = diaperRecords[0]
    const elapsed = lastDiaper ? formatElapsed(lastDiaper.timestamp) : null

    const handleQuickRecord = async (diaperType: DiaperType, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setLoading(true)
        try {
            await api.post("/diapers/", {
                baby_id: Number(babyId),
                diaper_type: diaperType,
                change_time: new Date().toISOString(),
            })
            if (mutate) mutate()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 transition-colors">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-amber-500 dark:text-amber-400 flex items-center gap-1">
                    👶 おむつ
                </CardTitle>
                <Link href={`/diaper?baby_id=${babyId}`}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mr-2 text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 dark:text-zinc-600"
                        aria-label="おむつ詳細"
                        title="詳細を見る"
                    >
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    {elapsed ? (
                        <p className="text-2xl font-bold text-gray-800 dark:text-zinc-100">{elapsed}</p>
                    ) : (
                        <p className="text-sm text-gray-400 dark:text-zinc-600">記録なし</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                        今日: 💧{wetCount} / 💩{dirtyCount}
                    </p>
                </div>
                {canWrite ? (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            loading={loading}
                            onClick={(e) => handleQuickRecord(DiaperType.WET, e)}
                            className="flex-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-0 text-xs h-8"
                            variant="outline"
                            aria-label="おしっこ"
                        >
                            💧
                        </Button>
                        <Button
                            size="sm"
                            loading={loading}
                            onClick={(e) => handleQuickRecord(DiaperType.DIRTY, e)}
                            className="flex-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-0 text-xs h-8"
                            variant="outline"
                            aria-label="うんち"
                        >
                            💩
                        </Button>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    )
}
