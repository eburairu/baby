"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFeedings } from "@/hooks/useData"
import { api } from "@/lib/api"
import { formatElapsed, isToday } from "@/lib/ageUtils"
import Link from "next/link"
import { ArrowRight, ShieldOff } from "lucide-react"

interface Props {
    babyId: string
}

export function FeedingWidget({ babyId }: Props) {
    const { feedings, isError, mutate } = useFeedings(babyId)
    const [loading, setLoading] = useState(false)

    const isAccessDenied = (isError as any)?.status === 403

    if (isAccessDenied) {
        return (
            <Card className="bg-white rounded-2xl shadow-sm border-0 opacity-60">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-1">
                        🍼 授乳
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                    <ShieldOff className="h-6 w-6 text-gray-300 mb-1" />
                    <p className="text-[10px] text-gray-400">閲覧制限中</p>
                </CardContent>
            </Card>
        )
    }

    const todayCount = feedings?.filter((f) => isToday(f.feeding_time)).length ?? 0
    const lastFeeding = feedings?.[0]
    const elapsed = lastFeeding ? formatElapsed(lastFeeding.feeding_time) : null

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
            mutate()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="bg-white rounded-2xl shadow-sm border-0">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-rose-500 flex items-center gap-1">
                    🍼 授乳
                </CardTitle>
                <Link href={`/feeding?baby_id=${babyId}`}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mr-2 text-gray-400 hover:text-rose-500"
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
                        <p className="text-2xl font-bold text-gray-800">{elapsed}</p>
                    ) : (
                        <p className="text-sm text-gray-400">記録なし</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">今日: {todayCount}回</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        loading={loading}
                        onClick={(e) => handleQuickRecord("bottle", e)}
                        className="flex-1 bg-rose-50 text-rose-600 hover:bg-rose-100 border-0 text-xs h-8"
                        variant="outline"
                    >
                        ミルク
                    </Button>
                    <Button
                        size="sm"
                        loading={loading}
                        onClick={(e) => handleQuickRecord("breast", e)}
                        className="flex-1 bg-rose-50 text-rose-600 hover:bg-rose-100 border-0 text-xs h-8"
                        variant="outline"
                    >
                        母乳
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
