"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ContractionRecord } from "@/types/contraction"
import { calculateStats } from "@/lib/contractionUtils"
import { formatSecondsToJapanese } from "@/lib/ageUtils"

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
            <div className="grid grid-cols-3 gap-3">
                <Card>
                    <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-xs text-muted-foreground font-normal">直近1時間</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <p className="text-2xl font-bold">{stats.count}<span className="text-sm font-normal text-muted-foreground ml-1">回</span></p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-xs text-muted-foreground font-normal">平均持続</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <p className="text-2xl font-bold">
                            {stats.avgDuration != null ? formatSecondsToJapanese(stats.avgDuration) : "—"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-xs text-muted-foreground font-normal">平均間隔</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <p className="text-2xl font-bold">
                            {stats.avgInterval != null ? formatSecondsToJapanese(stats.avgInterval) : "—"}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
