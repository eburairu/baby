"use client"

import { useState } from "react"
import { BookOpen, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useBabies } from "@/hooks/useData"
import { useBabyStore } from "@/stores/babyStore"
import { useDailySummaries, generateDailySummary, editDailySummary, deleteDailySummary } from "@/hooks/useDailySummary"
import { usePermissions } from "@/hooks/usePermissions"
import { DiarySummaryCard } from "@/components/diary/DiarySummaryCard"
import { DiaryEditDialog } from "@/components/diary/DiaryEditDialog"
import { DiaryDeleteDialog } from "@/components/diary/DiaryDeleteDialog"
import { PageLoading } from "@/components/ui/page-loading"
import { AccessDenied } from "@/components/ui/access-denied"
import { DailySummary } from "@/types/dailySummary"
import { isApiError } from "@/lib/api"

function getTodayJST(): string {
    return new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
        .format(new Date())
        .replace(/\//g, "-")
}

export default function DiaryPage() {
    const { babies, isLoading: babiesLoading } = useBabies()
    const { selectedBabyId } = useBabyStore()
    const { canWrite } = usePermissions()

    const effectiveBabyIdStr =
        selectedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)
    const babyId = effectiveBabyIdStr ? parseInt(effectiveBabyIdStr, 10) : null

    const { summaries, isLoading: summariesLoading, error: summariesError, mutate } = useDailySummaries(babyId)

    const [isGenerating, setIsGenerating] = useState(false)
    const [generateError, setGenerateError] = useState<string | null>(null)
    const [editTarget, setEditTarget] = useState<DailySummary | null>(null)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<DailySummary | null>(null)
    const [deleteOpen, setDeleteOpen] = useState(false)

    const todayStr = getTodayJST()
    const hasTodaySummary = summaries?.some((s) => s.summary_date === todayStr) ?? false

    const handleGenerate = async () => {
        if (!babyId) return
        setIsGenerating(true)
        setGenerateError(null)
        try {
            await generateDailySummary(babyId, todayStr)
            await mutate()
        } catch (err: unknown) {
            const detail = isApiError(err) ? ((err.info as { detail?: string })?.detail || "日誌の生成に失敗しました。") : "日誌の生成に失敗しました。"
            setGenerateError(detail)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleEditOpen = (summary: DailySummary) => {
        setEditTarget(summary)
        setEditOpen(true)
    }

    const handleEditSave = async (summaryDate: string, editedContent: string | null, imageUrls: string[]) => {
        if (!babyId) return
        await editDailySummary(babyId, summaryDate, editedContent, imageUrls)
        await mutate()
    }

    const handleDeleteOpen = (summary: DailySummary) => {
        setDeleteTarget(summary)
        setDeleteOpen(true)
    }

    const handleDeleteConfirm = async (summaryDate: string) => {
        if (!babyId) return
        await deleteDailySummary(babyId, summaryDate)
        await mutate()
    }

    if (babiesLoading) return <PageLoading />

    if (!babyId) {
        return (
            <div className="p-4 text-center">
                <p>赤ちゃんが登録されていません。</p>
            </div>
        )
    }

    const isAccessDenied = isApiError(summariesError) && summariesError.status === 403

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 transition-colors">
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-center h-14 px-4 max-w-2xl mx-auto">
                    <h1 className="text-base font-semibold text-gray-800 dark:text-zinc-100 flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                        育児日誌
                    </h1>
                </div>
            </header>

            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {isAccessDenied ? (
                    <AccessDenied />
                ) : (
                    <>
                        {/* 今日の日誌生成ボタン */}
                        {canWrite && (
                            <div className="space-y-2">
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || hasTodaySummary}
                                    className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-medium"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            生成中...
                                        </>
                                    ) : hasTodaySummary ? (
                                        "📔 今日の日誌は生成済みです"
                                    ) : (
                                        "📔 今日の育児日誌を生成"
                                    )}
                                </Button>
                                {generateError && (
                                    <p className="text-sm text-red-500 dark:text-red-400 text-center">{generateError}</p>
                                )}
                            </div>
                        )}

                        {/* 日誌一覧 */}
                        {summariesLoading ? (
                            <PageLoading />
                        ) : !summaries || summaries.length === 0 ? (
                            <div className="text-center text-gray-400 dark:text-zinc-500 py-12">
                                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                <p className="text-sm">まだ育児日誌がありません。</p>
                                <p className="text-xs mt-1">育児記録がある日に「今日の育児日誌を生成」を押してください。</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {summaries.map((summary) => (
                                    <DiarySummaryCard
                                        key={summary.id}
                                        summary={summary}
                                        onEdit={handleEditOpen}
                                        onDelete={handleDeleteOpen}
                                        canWrite={canWrite}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <DiaryEditDialog
                summary={editTarget}
                open={editOpen}
                onOpenChange={setEditOpen}
                onSave={handleEditSave}
                canWrite={canWrite}
            />
            <DiaryDeleteDialog
                summary={deleteTarget}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    )
}
