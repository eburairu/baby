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
        <div className="grid grid-cols-2 gap-4">
            <Card className="bg-indigo-50 border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full text-indigo-500 shadow-sm">
                        <Moon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-indigo-600 font-medium">今日の睡眠回数</p>
                        <p className="text-xl font-bold text-indigo-900">{count}回</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-indigo-50 border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full text-indigo-500 shadow-sm">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-indigo-600 font-medium">合計時間</p>
                        <p className="text-xl font-bold text-indigo-900">{hours}h {minutes}m</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
