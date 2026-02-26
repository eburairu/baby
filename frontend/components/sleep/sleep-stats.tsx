"use client"

import { useSleeps } from "@/hooks/useData"
import { isToday } from "@/lib/dateUtils"
import { Moon, Clock } from "lucide-react"
import { StatsBlock } from "@/components/ui/stats-block"
import { StatsCard } from "@/components/ui/stats-card"

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
        <StatsCard>
            <div className="grid grid-cols-2 gap-4">
                <StatsBlock
                    icon={Moon}
                    label="今日の睡眠回数"
                    value={`${count}回`}
                    color="indigo"
                />
                <StatsBlock
                    icon={Clock}
                    label="合計時間"
                    value={`${hours}h ${minutes}m`}
                    color="indigo"
                />
            </div>
        </StatsCard>
    )
}
