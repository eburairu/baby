"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFeedings } from "@/hooks/useData"
import { api } from "@/lib/api"
import { formatElapsed, isToday } from "@/lib/ageUtils"

interface Props {
    babyId: string
}

export function FeedingWidget({ babyId }: Props) {
    const { feedings, mutate } = useFeedings(babyId)
    const [loading, setLoading] = useState(false)

    const todayCount = feedings?.filter((f) => isToday(f.start_time)).length ?? 0
    const lastFeeding = feedings?.[0]
    const elapsed = lastFeeding ? formatElapsed(lastFeeding.start_time) : null

    const handleQuickRecord = async (feedingType: string) => {
        setLoading(true)
        try {
            await api.post("/feedings/", {
                baby_id: Number(babyId),
                feeding_type: feedingType,
                start_time: new Date().toISOString(),
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
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-rose-500 flex items-center gap-1">
                    🍼 授乳
                </CardTitle>
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
                        disabled={loading}
                        onClick={() => handleQuickRecord("bottle")}
                        className="flex-1 bg-rose-50 text-rose-600 hover:bg-rose-100 border-0 text-xs h-8"
                        variant="outline"
                    >
                        ミルク
                    </Button>
                    <Button
                        size="sm"
                        disabled={loading}
                        onClick={() => handleQuickRecord("breast")}
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
