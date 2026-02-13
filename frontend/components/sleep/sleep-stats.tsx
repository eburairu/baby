"use client"

import { useSleeps } from "@/hooks/useData"
import { isToday } from "@/lib/ageUtils"
import { Card, CardContent } from "@/components/ui/card"
import { Moon, Clock } from "lucide-react"

interface Props {
    babyId: string
}

export function SleepStats({ babyId }: Props) {
    const { sleeps } = useSleeps(babyId)

    const todaySleeps = sleeps?.filter((s) => isToday(s.start_time)) ?? []

    // Calculate total duration (minutes)
    const totalMinutes = todaySleeps.reduce((acc, s) => {
        if (!s.end_time) return acc // Ignore active sleep for total count or handle it as 'so far'
        const ms = new Date(s.end_time).getTime() - new Date(s.start_time).getTime()
        return acc + Math.floor(ms / 60000)
    }, 0)

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const count = todaySleeps.length

    return (
        <Card className="bg-white rounded-2xl shadow-sm border-0 mb-6">
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 rounded-xl p-4 flex items-center gap-3">
                        <div className="bg-white rounded-full p-2 shadow-sm">
                            <Moon className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">今日の睡眠回数</p>
                            <p className="text-lg font-bold text-gray-800">{count}回</p>
                        </div>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4 flex items-center gap-3">
                        <div className="bg-white rounded-full p-2 shadow-sm">
                            <Clock className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">合計時間</p>
                            <p className="text-lg font-bold text-gray-800">{hours}h {minutes}m</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
