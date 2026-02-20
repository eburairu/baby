"use client"
import { useState, useEffect } from "react"
import { useBabies, useRecords } from "@/hooks/useData"
import { usePermissions } from "@/hooks/usePermissions"
import Link from "next/link"
import { useBabyStore } from "@/stores/babyStore"
import { api, isApiError } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BabyProfileCard } from "@/components/dashboard/BabyProfileCard"
import { FeedingWidget } from "@/components/dashboard/FeedingWidget"
import { SleepWidget } from "@/components/dashboard/SleepWidget"
import { DiaperWidget } from "@/components/dashboard/DiaperWidget"
import { GrowthWidget } from "@/components/dashboard/GrowthWidget"
import { NoteWidget } from "@/components/dashboard/NoteWidget"
import { BirthRegistrationDialog } from "@/components/dashboard/BirthRegistrationDialog"
import { QuickActionBar } from "@/components/dashboard/QuickActionBar"
import { isBorn } from "@/lib/babyUtils"
import { PageLoading } from "@/components/ui/page-loading"
import dynamic from "next/dynamic"

const RecentActivityFeed = dynamic(() => import("@/components/dashboard/RecentActivityFeed").then(mod => mod.RecentActivityFeed), {
    loading: () => <div className="h-32 animate-pulse bg-gray-100 dark:bg-zinc-800 rounded-2xl" />,
    ssr: false
})

export default function Dashboard() {
    const { babies, isLoading: babiesLoading, mutate: mutateBabies } = useBabies()
    const { selectedBabyId, setSelectedBabyId } = useBabyStore()
    const { isAdmin, isLoading: permsLoading } = usePermissions()

    // selectedBabyId を auto-persist: 2回目以降の訪問で useBabies と useRecords を並列フェッチ
    useEffect(() => {
        if (!selectedBabyId && babies && babies.length > 0) {
            setSelectedBabyId(String(babies[0].id))
        }
    }, [babies, selectedBabyId, setSelectedBabyId])

    const [newBabyName, setNewBabyName] = useState("")
    const [newBabyBirthday, setNewBabyBirthday] = useState("")
    const [newBabyGender, setNewBabyGender] = useState("unknown")
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // 最初の赤ちゃんをデフォルト選択
    const effectiveId = selectedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)

    // 記録の一括取得
    const { records, isLoading: recordsLoading, isError: recordsError, mutate: mutateRecords } = useRecords(effectiveId)

    const handleAddBaby = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newBabyName) return
        setSubmitting(true)
        try {
            setError(null)
            const body: Record<string, string> = { name: newBabyName, gender: newBabyGender }
            if (newBabyBirthday) body.birthday = newBabyBirthday
            await api.post("/babies/", body)
            setNewBabyName("")
            setNewBabyBirthday("")
            setNewBabyGender("unknown")
            mutateBabies()
        } catch (err: unknown) {
            console.error("赤ちゃんの追加に失敗しました", err)
            setError(isApiError(err) ? ((err.info as { detail?: string })?.detail || "赤ちゃんの追加に失敗しました") : "赤ちゃんの追加に失敗しました")
        } finally {
            setSubmitting(false)
        }
    }

    if (babiesLoading || permsLoading) {
        return (
            <div className="min-h-64 flex items-center justify-center">
                <PageLoading message="データを読み込んでいます..." />
            </div>
        )
    }

    // オンボーディング: 赤ちゃん未登録
    if (!babies || babies.length === 0) {
        if (!isAdmin) {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md rounded-2xl shadow-sm border-0 dark:bg-zinc-900">
                        <CardHeader>
                            <CardTitle className="text-xl text-amber-600 dark:text-amber-500">赤ちゃんが未登録です</CardTitle>
                            <CardDescription className="dark:text-zinc-400">
                                ファミリーの管理者に赤ちゃんの登録を依頼してください。
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            )
        }
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4">
                <Card className="w-full max-w-md rounded-2xl shadow-sm border-0 dark:bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="text-xl dark:text-zinc-100">ようこそ！</CardTitle>
                        <CardDescription className="dark:text-zinc-400">
                            赤ちゃんの情報を登録して、育児記録を始めましょう。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddBaby} className="space-y-4">
                            {error ? <div className="text-red-500 dark:text-red-400 text-sm">{error}</div> : null}
                            <div className="space-y-2">
                                <Label htmlFor="babyName" className="dark:text-zinc-300">赤ちゃんの名前 <span className="text-red-500">*</span></Label>
                                <Input
                                    id="babyName"
                                    value={newBabyName}
                                    onChange={(e) => setNewBabyName(e.target.value)}
                                    placeholder="例: れん"
                                    required
                                    className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="babyBirthday" className="dark:text-zinc-300">誕生日（任意）</Label>
                                <Input
                                    id="babyBirthday"
                                    type="date"
                                    max="9999-12-31"
                                    value={newBabyBirthday}
                                    onChange={(e) => setNewBabyBirthday(e.target.value)}
                                    className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="dark:text-zinc-300">性別 <span className="text-red-500">*</span></Label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer dark:text-zinc-300">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="boy"
                                            checked={newBabyGender === "boy"}
                                            onChange={(e) => setNewBabyGender(e.target.value)}
                                            required
                                            className="dark:bg-zinc-800 dark:border-zinc-700"
                                        />
                                        男の子
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer dark:text-zinc-300">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="girl"
                                            checked={newBabyGender === "girl"}
                                            onChange={(e) => setNewBabyGender(e.target.value)}
                                            className="dark:bg-zinc-800 dark:border-zinc-700"
                                        />
                                        女の子
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer dark:text-zinc-300">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="unknown"
                                            checked={newBabyGender === "unknown"}
                                            onChange={(e) => setNewBabyGender(e.target.value)}
                                            className="dark:bg-zinc-800 dark:border-zinc-700"
                                        />
                                        わからない
                                    </label>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
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

    const babiesWithStrId = babies.map((b) => ({ ...b, id: String(b.id) }))
    const selectedBaby = babies?.find((b) => String(b.id) === effectiveId)
    const born = selectedBaby ? isBorn(selectedBaby.birthday) : true

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors">
            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {/* プロフィールカード */}
                <BabyProfileCard
                    babies={babiesWithStrId}
                    selectedBabyId={effectiveId}
                />

                {/* 出生前: 「生まれた！」ボタン */}
                {!born && selectedBaby && (
                    <BirthRegistrationDialog
                        babyId={effectiveId}
                        babyName={selectedBaby.name}
                        onSuccess={() => mutateBabies()}
                    />
                )}

                {/* ウィジェットグリッド */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {born && <FeedingWidget babyId={effectiveId} records={records} isError={recordsError} mutate={mutateRecords} isLoading={recordsLoading} />}
                    {born && <SleepWidget babyId={effectiveId} records={records} isError={recordsError} mutate={mutateRecords} isLoading={recordsLoading} />}
                    {born && <DiaperWidget babyId={effectiveId} records={records} isError={recordsError} mutate={mutateRecords} isLoading={recordsLoading} />}
                    {born && <GrowthWidget babyId={effectiveId} records={records} isError={recordsError} isLoading={recordsLoading} />}
                    <NoteWidget babyId={effectiveId} records={records} isLoading={recordsLoading} />
                </div>

                {/* 育児日誌へのリンク */}
                <Link href="/diary" className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-medium shadow-sm transition-colors flex items-center justify-center">
                    📔 育児日誌
                </Link>

                {/* 陣痛タイマーへのリンク（出生前のみ） */}
                {!born && (
                    <Link href="/contraction" className="w-full h-12 rounded-2xl bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium shadow-sm transition-colors flex items-center justify-center">
                        🤰 陣痛タイマー
                    </Link>
                )}

                {/* Recent Activity */}
                <RecentActivityFeed
                    key={effectiveId}
                    babyId={effectiveId}
                    records={records}
                    isLoading={recordsLoading}
                    mutate={mutateRecords}
                />

                {/* クイックアクションバー (FAB) */}
                {born && <QuickActionBar babyId={effectiveId} mutateRecords={mutateRecords} records={records} />}
            </div>
        </div>
    )
}
