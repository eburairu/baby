"use client"

import { useState, useEffect } from "react"
import { useBabies, useContractions } from "@/hooks/useData"
import ContractionTimer from "@/components/ContractionTimer"
import ContractionStats from "@/components/ContractionStats"
import ContractionHistory from "@/components/ContractionHistory"
import ContractionGraph from "@/components/ContractionGraph"
import { Button } from "@/components/ui/button"
import type { ContractionRecord } from "@/types/contraction"

export default function ContractionPage() {
    const { babies, isLoading: babiesLoading } = useBabies()
    const [selectedBabyId, setSelectedBabyId] = useState<number | null>(null)

    // 最初の赤ちゃんを自動選択（React anti-patternをuseEffectで修正）
    useEffect(() => {
        if (babies && babies.length > 0 && selectedBabyId === null) {
            setSelectedBabyId(babies[0].id)
        }
    // selectedBabyIdは意図的に除外（初回のみ実行）
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [babies])

    const { contractions, isLoading: contractionsLoading, mutate } = useContractions(selectedBabyId)

    const handleRecorded = () => mutate()
    const handleDeleted = () => mutate()

    if (babiesLoading) {
        return <div className="flex justify-center py-12 text-muted-foreground">読み込み中...</div>
    }

    if (!babies || babies.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                赤ちゃんが登録されていません。ダッシュボードから登録してください。
            </div>
        )
    }

    const typedContractions: ContractionRecord[] = contractions ?? []
    // APIは降順（新しい順）なので[0]が最新
    const lastContraction = typedContractions[0] ?? null

    return (
        <div className="space-y-6">
            {/* ヘッダー */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">🤰 陣痛タイマー</h2>
                <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    ← ダッシュボード
                </a>
            </div>

            {/* Baby選択 */}
            {babies.length > 1 && (
                <div className="flex gap-2">
                    {babies.map((baby: { id: number; name: string }) => (
                        <Button
                            key={baby.id}
                            variant={selectedBabyId === baby.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedBabyId(baby.id)}
                        >
                            {baby.name}
                        </Button>
                    ))}
                </div>
            )}

            {/* 統計 */}
            <ContractionStats contractions={typedContractions} />

            {/* タイマー */}
            {selectedBabyId && (
                <ContractionTimer
                    babyId={selectedBabyId}
                    onRecorded={handleRecorded}
                    lastContraction={lastContraction}
                />
            )}

            {/* グラフ（2件以上の記録がある場合のみ表示） */}
            {typedContractions.length >= 2 && (
                <ContractionGraph contractions={typedContractions} />
            )}

            {/* 履歴 */}
            {contractionsLoading ? (
                <div className="text-center py-4 text-muted-foreground">記録を読み込み中...</div>
            ) : (
                <ContractionHistory contractions={typedContractions} onDeleted={handleDeleted} />
            )}
        </div>
    )
}
