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
import { OnboardingForm } from "@/components/dashboard/OnboardingForm"
import { QuickActionBar } from "@/components/dashboard/QuickActionBar"
import { isBorn } from "@/lib/babyUtils"
import { PageLoading } from "@/components/ui/page-loading"
import { Skeleton } from "@/components/ui/skeleton"
import dynamic from "next/dynamic"

const RecentActivityFeed = dynamic(() => import("@/components/dashboard/RecentActivityFeed").then(mod => mod.RecentActivityFeed), {
    loading: () => <Skeleton className="h-32 w-full rounded-2xl" />,
    ssr: false
})

function DashboardSkeleton() {
    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-2xl" />
                ))}
            </div>
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
    )
}

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

    // 最初の赤ちゃんをデフォルト選択
    const effectiveId = selectedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)

    // 記録の一括取得
    const { records, isLoading: recordsLoading, isError: recordsError, mutate: mutateRecords } = useRecords(effectiveId)

    if (babiesLoading || permsLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
                <DashboardSkeleton />
            </div>
        )
    }

    // オンボーディング: 赤ちゃん未登録
    if (!babies || babies.length === 0) {
        return <OnboardingForm isAdmin={!!isAdmin} onSuccess={() => mutateBabies()} />
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
