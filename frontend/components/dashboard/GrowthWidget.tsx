"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useGrowths } from "@/hooks/useData"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface Props {
    babyId: string
}

export function GrowthWidget({ babyId }: Props) {
    const { growths } = useGrowths(babyId)

    const latest = growths?.[0] ?? null

    const measureDate = latest?.measured_at
        ? new Date(latest.measured_at).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })
        : null

    return (
        <Card className="bg-white rounded-2xl shadow-sm border-0">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-emerald-500 flex items-center gap-1">
                    📏 成長
                </CardTitle>
                <Link href={`/growth?baby_id=${babyId}`}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-gray-400 hover:text-emerald-500">
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="space-y-3">
                {latest ? (
                    <div className="space-y-1">
                        {latest.weight_kg != null && (
                            <p className="text-2xl font-bold text-gray-800">
                                {latest.weight_kg} <span className="text-sm font-normal text-gray-500">kg</span>
                            </p>
                        )}
                        {latest.height_cm != null && (
                            <p className="text-sm text-gray-600">
                                身長 {latest.height_cm} cm
                            </p>
                        )}
                        {measureDate && (
                            <p className="text-xs text-gray-400">{measureDate}測定</p>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400">記録なし</p>
                )}
            </CardContent>
        </Card>
    )
}
