"use client"

import { memo } from "react"
import { Lightbulb } from "lucide-react"
import { getTodayTip } from "@/lib/daily-tips"

interface Props {
    ageMonths: number
}

export const DailyTipCard = memo(function DailyTipCard({ ageMonths }: Props) {
    const tip = getTodayTip(ageMonths)

    return (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 px-4 py-3 flex items-start gap-3">
            <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 mb-0.5">
                    今日のヒント
                </p>
                <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">
                    <span className="mr-1.5">{tip.icon}</span>
                    {tip.text}
                </p>
            </div>
        </div>
    )
})
