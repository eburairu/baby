"use client"
import { AppIcons } from "@/constants/icons"

import { useState } from "react"
import { Loader2, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useBabies } from "@/hooks/useBabies"
import { useBabyStore } from "@/stores/babyStore"
import { useDailySummaries, generateDailySummary, editDailySummary, deleteDailySummary } from "@/hooks/useDailySummary"
import { usePermissions } from "@/hooks/usePermissions"
import { DiarySummaryCard } from "@/components/diary/DiarySummaryCard"
import { DiaryEditDialog } from "@/components/diary/DiaryEditDialog"
import { DiaryDeleteDialog } from "@/components/diary/DiaryDeleteDialog"
import { TipsCard } from "@/components/ui/tips-card"
import { diaryTips } from "@/lib/tips-data"
import { DailySummary } from "@/types/dailySummary"
import { isApiError } from "@/lib/api"
import { RecordPageLayout } from "@/components/ui/record-page-layout"

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

    const todayStr = getTodayJST()
    const [selectedDate, setSelectedDate] = useState<string>(todayStr)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generateError, setGenerateError] = useState<string | null>(null)
    const [editTarget, setEditTarget] = useState<DailySummary | null>(null)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<DailySummary | null>(null)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [regenConfirmOpen, setRegenConfirmOpen] = useState(false)

    const selectedSummary = summaries?.find((s) => s.summary_date === selectedDate) ?? null
    const hasSelectedSummary = selectedSummary !== null
    const isSelectedEdited = selectedSummary?.is_edited ?? false

    const handleRefresh = async () => {
        await mutate()
    }

    const doGenerate = async (forceRegen = false) => {
        if (!babyId) return
        setIsGenerating(true)
        setGenerateError(null)
        try {
            // 手動編集済みを確認の上で再生成する場 合は先に編集をクリアする。
            // バックエンドは is_edited=true のレコ ードを再生成せず返すため、
            // クリアしないと再生成が行われないまま 成功扱いになってしまう。
            if (forceRegen && selectedSummary?.is_edited) {
                await editDailySummary(babyId, selectedDate, null, selectedSummary.image_urls ?? [])
            }
            await generateDailySummary(babyId, selectedDate)
            await mutate()
        } catch (err: unknown) {
            const detail = isApiError(err) ? ((err.info as { detail?: string })?.detail || "日誌の生成に失敗しました。") : "日誌の生成に失敗しました。"
            setGenerateError(detail)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleGenerate = () => {
        if (isSelectedEdited) {
            setRegenConfirmOpen(true)
        } else {
            doGenerate()
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

    return (
        <RecordPageLayout
            title="育児日誌"
            icon={AppIcons.diary}
            iconColorClass="text-amber-500 dark:text-amber-400"
            isLoading={babiesLoading}
            isDataLoading={summariesLoading}
            apiError={summariesError}
            babyId={effectiveBabyIdStr ?? undefined}
            onRefresh={handleRefresh}
        >
            <TipsCard {...diaryTips} />

            {/* 日付指定生成パネル */}
            {canWrite && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 space-y-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                        日付を指定して日誌を生成
                    </p>
                    <div className="flex gap-2">
                        <Input
                            type="date"
                            value={selectedDate}
                            max={todayStr}
                            onChange={(e) => {
                                setSelectedDate(e.target.value)
                                setGenerateError(null)
                            }}
                            className="flex-1 rounded-xl border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || !selectedDate}
                            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium px-5"
                        >
                            {isGenerating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : hasSelectedSummary ? (
                                "再生成"
                            ) : (
                                "生成"
                            )}
                        </Button>
                    </div>
                    {generateError && (
                        <p className="text-sm text-red-500 dark:text-red-400">{generateError}</p>
                    )}
                </div>
            )}

            {/* 日誌一覧 */}
            {!summaries || summaries.length === 0 ? (
                <div className="text-center text-gray-400 dark:text-zinc-500 py-12">
                    <AppIcons.diary className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">まだ育児日誌がありません。</p>
                    <p className="text-xs mt-1">育児記録がある日の日付を選んで「生成」を押してください。</p>
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

            {/* 手動編集済み日誌の再生成確認ダイアログ */}
            <AlertDialog open={regenConfirmOpen} onOpenChange={setRegenConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>手動編集済みの日誌を再生成しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                            この日誌は手動編集されています。再生成すると編集内容が上書きされます。続けますか？
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setRegenConfirmOpen(false)
                                doGenerate(true)
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                            再生成する
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </RecordPageLayout>
    )
}
