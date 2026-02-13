"use client"
import { useState } from "react"
import { useBabies } from "@/hooks/useData"
import Link from "next/link"
import { useBabyStore } from "@/stores/babyStore"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BabyProfileCard } from "@/components/dashboard/BabyProfileCard"
import { FeedingWidget } from "@/components/dashboard/FeedingWidget"
import { SleepWidget } from "@/components/dashboard/SleepWidget"
import { DiaperWidget } from "@/components/dashboard/DiaperWidget"
import { GrowthWidget } from "@/components/dashboard/GrowthWidget"
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed"

export default function Dashboard() {
    const { babies, isLoading: babiesLoading, mutate: mutateBabies } = useBabies()
    const { selectedBabyId, setSelectedBabyId } = useBabyStore()

    const [newBabyName, setNewBabyName] = useState("")
    const [newBabyBirthday, setNewBabyBirthday] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // 最初の赤ちゃんをデフォルト選択
    const effectiveId = selectedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)

    const handleAddBaby = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newBabyName) return
        setSubmitting(true)
        try {
            setError(null)
            const body: Record<string, string> = { name: newBabyName }
            if (newBabyBirthday) body.birthday = newBabyBirthday
            await api.post("/babies/", body)
            setNewBabyName("")
            setNewBabyBirthday("")
            mutateBabies()
        } catch (err: any) {
            console.error("赤ちゃんの追加に失敗しました", err)
            setError(err.info?.detail || "赤ちゃんの追加に失敗しました")
        } finally {
            setSubmitting(false)
        }
    }

    if (babiesLoading) {
        return (
            <div className="flex items-center justify-center min-h-64 text-gray-400">
                読み込み中...
            </div>
        )
    }

    // オンボーディング: 赤ちゃん未登録
    if (!babies || babies.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md rounded-2xl shadow-sm border-0">
                    <CardHeader>
                        <CardTitle className="text-xl">ようこそ！</CardTitle>
                        <CardDescription>
                            赤ちゃんの情報を登録して、育児記録を始めましょう。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddBaby} className="space-y-4">
                            {error && <div className="text-red-500 text-sm">{error}</div>}
                            <div className="space-y-2">
                                <Label htmlFor="babyName">赤ちゃんの名前 <span className="text-red-500">*</span></Label>
                                <Input
                                    id="babyName"
                                    value={newBabyName}
                                    onChange={(e) => setNewBabyName(e.target.value)}
                                    placeholder="例: れん"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="babyBirthday">誕生日（任意）</Label>
                                <Input
                                    id="babyBirthday"
                                    type="date"
                                    value={newBabyBirthday}
                                    onChange={(e) => setNewBabyBirthday(e.target.value)}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={submitting}
                            >
                                登録する
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!effectiveId) return null

    const babiesWithStrId = babies.map((b: any) => ({ ...b, id: String(b.id) }))

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {/* プロフィールカード & 赤ちゃん切替 */}
                <BabyProfileCard
                    babies={babiesWithStrId}
                    selectedBabyId={effectiveId}
                    onSelect={(id) => setSelectedBabyId(id)}
                />

                {/* ウィジェットグリッド */}
                <div className="grid grid-cols-2 gap-4">
                    <FeedingWidget babyId={effectiveId} />
                    <SleepWidget babyId={effectiveId} />
                    <DiaperWidget babyId={effectiveId} />
                    <GrowthWidget babyId={effectiveId} />
                </div>

                {/* 陣痛タイマーへのリンク */}
                <Link href="/contraction" className="w-full h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors flex items-center justify-center">
                        🤰 陣痛タイマー
                    </Link>

                {/* Recent Activity */}
                <RecentActivityFeed babyId={effectiveId} />
            </div>
        </div>
    )
}
