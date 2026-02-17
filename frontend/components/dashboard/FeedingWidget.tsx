"use client"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/usePermissions"
import { api, isApiError } from "@/lib/api"
import { formatElapsed, isToday } from "@/lib/ageUtils"
import Link from "next/link"
import { ArrowRight, ShieldOff } from "lucide-react"
import { BabyRecord } from "@/hooks/useData"
import { FeedingType } from "@/types/feeding"

interface Props {
    babyId: string
    records?: BabyRecord[]
    isError?: unknown
    mutate?: () => void
}

export function FeedingWidget({ babyId, records, isError, mutate }: Props) {
    const { canWrite } = usePermissions()
    const [loading, setLoading] = useState(false)

    const isAccessDenied = isApiError(isError) && isError.status === 403

    const { todayCount, elapsed } = useMemo(() => {
        const feedingRecords = records?.filter(r => r.type === 'feeding') ?? []
        return {
            todayCount: feedingRecords.filter((f) => isToday(f.timestamp)).length,
            elapsed: feedingRecords[0] ? formatElapsed(feedingRecords[0].timestamp) : null,
        }
    }, [records])

    if (isAccessDenied) {
        return (
            <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 opacity-60 transition-colors">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-400 dark:text-zinc-500 flex items-center gap-1">
                        🍼 授乳
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                    <ShieldOff className="h-6 w-6 text-gray-300 dark:text-zinc-700 mb-1" />
                    <p className="text-[10px] text-gray-400 dark:text-zinc-600">閲覧制限中</p>
                </CardContent>
            </Card>
        )
    }



    const handleQuickRecord = async (feedingType: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setLoading(true)
        try {
            await api.post("/feedings/", {
                baby_id: Number(babyId),
                feeding_type: feedingType.toUpperCase(),
                feeding_time: new Date().toISOString(),
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
                <CardTitle className="text-sm font-medium text-rose-500 dark:text-rose-400 flex items-center gap-1">
                    🍼 授乳
                </CardTitle>
                <Link href={`/feeding?baby_id=${babyId}`}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mr-2 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 dark:text-zinc-600"
                        aria-label="授乳詳細"
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
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">今日: {todayCount}回</p>
                </div>
                {canWrite ? (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            loading={loading}
                            onClick={(e) => handleQuickRecord("bottle", e)}
                            className="flex-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border-0 text-xs h-8"
                            variant="outline"
                        >
                            ミルク
                        </Button>
                        <Button
                            size="sm"
                            loading={loading}
                            onClick={(e) => handleQuickRecord("breast", e)}
                            className="flex-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border-0 text-xs h-8"
                            variant="outline"
                        >
                            母乳
                        </Button>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    )
}
