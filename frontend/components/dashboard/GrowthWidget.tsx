"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, ShieldOff } from "lucide-react"
import { isApiError } from "@/lib/api"
import { BabyRecord } from "@/hooks/useData"

interface Props {
    babyId: string
    records?: BabyRecord[]
    isError?: unknown
}

export function GrowthWidget({ babyId, records, isError }: Props) {
    const isAccessDenied = isApiError(isError) && isError.status === 403

    if (isAccessDenied) {
        return (
            <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 opacity-60 transition-colors">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-400 dark:text-zinc-500 flex items-center gap-1" data-sentry-unmask>
                        📏 成長
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                    <ShieldOff className="h-6 w-6 text-gray-300 dark:text-zinc-700 mb-1" />
                    <p className="text-[10px] text-gray-400 dark:text-zinc-600" data-sentry-unmask>閲覧制限中</p>
                </CardContent>
            </Card>
        )
    }

    const growthRecords = records?.filter(r => r.type === 'growth') ?? []
    const latest = growthRecords[0] ?? null

    const measureDate = latest?.timestamp
        ? new Date(latest.timestamp).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })
        : null

    const weight = latest?.details.weight_kg as number | undefined
    const height = latest?.details.height_cm as number | undefined

    return (
        <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 transition-colors">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-emerald-500 dark:text-emerald-400 flex items-center gap-1" data-sentry-unmask>
                    📏 成長
                </CardTitle>
                <Link href={`/growth?baby_id=${babyId}`}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 dark:text-zinc-600">
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="space-y-3">
                {latest ? (
                    <div className="space-y-1">
                        {weight != null && (
                            <p className="text-2xl font-bold text-gray-800 dark:text-zinc-100">
                                {weight * 1000} <span className="text-sm font-normal text-gray-500 dark:text-zinc-400">g</span>
                            </p>
                        )}
                        {height != null && (
                            <p className="text-sm text-gray-600 dark:text-zinc-300">
                                身長 {height} cm
                            </p>
                        )}
                        {measureDate && (
                            <p className="text-xs text-gray-400 dark:text-zinc-500">{measureDate}測定</p>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 dark:text-zinc-600" data-sentry-unmask>記録なし</p>
                )}
            </CardContent>
        </Card>
    )
}
