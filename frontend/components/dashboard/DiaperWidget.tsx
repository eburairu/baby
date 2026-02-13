"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDiapers } from "@/hooks/useData"
import { api } from "@/lib/api"
import { formatElapsed, isToday } from "@/lib/ageUtils"

interface Props {
    babyId: string
}

export function DiaperWidget({ babyId }: Props) {
    const { diapers, mutate } = useDiapers(babyId)
    const [loading, setLoading] = useState(false)

    const todayDiapers = diapers?.filter((d) => isToday(d.changed_at)) ?? []
    const wetCount = todayDiapers.filter((d) => d.diaper_type === "wet" || d.diaper_type === "both").length
    const dirtyCount = todayDiapers.filter((d) => d.diaper_type === "dirty" || d.diaper_type === "both").length

    const lastDiaper = diapers?.[0]
    const elapsed = lastDiaper ? formatElapsed(lastDiaper.changed_at) : null

    const handleQuickRecord = async (diaperType: string) => {
        setLoading(true)
        try {
            await api.post("/diapers/", {
                baby_id: Number(babyId),
                diaper_type: diaperType,
                changed_at: new Date().toISOString(),
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
                <CardTitle className="text-sm font-medium text-amber-500 flex items-center gap-1">
                    👶 おむつ
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    {elapsed ? (
                        <p className="text-2xl font-bold text-gray-800">{elapsed}</p>
                    ) : (
                        <p className="text-sm text-gray-400">記録なし</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        今日: おしっこ{wetCount}回 / うんち{dirtyCount}回
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        disabled={loading}
                        onClick={() => handleQuickRecord("wet")}
                        className="flex-1 bg-amber-50 text-amber-600 hover:bg-amber-100 border-0 text-xs h-8"
                        variant="outline"
                    >
                        おしっこ
                    </Button>
                    <Button
                        size="sm"
                        disabled={loading}
                        onClick={() => handleQuickRecord("dirty")}
                        className="flex-1 bg-amber-50 text-amber-600 hover:bg-amber-100 border-0 text-xs h-8"
                        variant="outline"
                    >
                        うんち
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
