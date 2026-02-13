"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDiapers } from "@/hooks/useData"
import { api } from "@/lib/api"
import { formatElapsed, isToday } from "@/lib/ageUtils"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Diaper, DiaperType } from "@/types/diaper"

interface Props {
    babyId: string
}

export function DiaperWidget({ babyId }: Props) {
    const { diapers, mutate } = useDiapers(babyId)
    const [loading, setLoading] = useState(false)

    const todayDiapers = (diapers as unknown as Diaper[])?.filter((d) => isToday(d.change_time)) ?? []
    const wetCount = todayDiapers.filter((d) => d.diaper_type === DiaperType.WET || d.diaper_type === DiaperType.BOTH).length
    const dirtyCount = todayDiapers.filter((d) => d.diaper_type === DiaperType.DIRTY || d.diaper_type === DiaperType.BOTH).length

    const lastDiaper = (diapers as unknown as Diaper[])?.[0]
    const elapsed = lastDiaper ? formatElapsed(lastDiaper.change_time) : null

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
                <CardTitle className="text-sm font-medium text-amber-500 flex items-center gap-1">
                    👶 おむつ
                </CardTitle>
                <Link href={`/diaper?baby_id=${babyId}`}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mr-2 text-gray-400 hover:text-amber-500"
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
                        <p className="text-2xl font-bold text-gray-800">{elapsed}</p>
                    ) : (
                        <p className="text-sm text-gray-400">記録なし</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        今日: 💧{wetCount} / 💩{dirtyCount}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        loading={loading}
                        onClick={(e) => handleQuickRecord(DiaperType.WET, e)}
                        className="flex-1 bg-amber-50 text-amber-600 hover:bg-amber-100 border-0 text-xs h-8"
                        variant="outline"
                        aria-label="おしっこ"
                    >
                        💧
                    </Button>
                    <Button
                        size="sm"
                        loading={loading}
                        onClick={(e) => handleQuickRecord(DiaperType.DIRTY, e)}
                        className="flex-1 bg-amber-50 text-amber-600 hover:bg-amber-100 border-0 text-xs h-8"
                        variant="outline"
                        aria-label="うんち"
                    >
                        💩
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
