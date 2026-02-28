"use client"

import { useMemo } from "react"
import type { ContractionRecord } from "@/types/contraction"
import { calculateStats } from "@/lib/contractionUtils"
import { formatSecondsToJapanese } from "@/lib/ageUtils"
import { StatsCard } from "@/components/ui/stats-card"
import { StatsBlock } from "@/components/ui/stats-block"
import { Activity, Clock, Timer } from "lucide-react"

interface ContractionStatsProps {
    contractions: ContractionRecord[]
}

export default function ContractionStats({ contractions }: ContractionStatsProps) {
    const stats = useMemo(() => calculateStats(contractions), [contractions])

    return (
        <div className="space-y-3">
            {/* 5-1-1 アラート */}
            {stats.shouldAlert && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-4 flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <p className="font-bold text-amber-800 dark:text-amber-300">病院に連絡してください</p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            5-1-1ルール: 陣痛間隔が5分以下、持続1分以上が続いています
                        </p>
                    </div>
                </div>
            )}

            {/* 統計カード */}
            <StatsCard>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatsBlock
                        icon={Activity}
                        label="直近1時間"
                        value={`${stats.count}回`}
                        color="rose"
                    />

                    <StatsBlock
                        icon={Timer}
                        label="平均持続"
                        value={stats.avgDuration != null ? formatSecondsToJapanese(stats.avgDuration) : "—"}
                        color="rose"
                    />

                    <StatsBlock
                        icon={Clock}
                        label="平均間隔"
                        value={stats.avgInterval != null ? formatSecondsToJapanese(stats.avgInterval) : "—"}
                        color="rose"
                    />
                </div>
            </StatsCard>
        </div>
    )
}
