"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useQuickRecord } from "@/hooks/useQuickRecord"
import { BabyRecord } from "@/types/record"
import { AppIcons } from "@/constants/icons"
import { StickyNote } from "lucide-react" // keep StickyNote for dialog title
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NoteForm } from "@/components/note/NoteForm"
import { HexagonButton } from "@/components/ui/hexagon-button"
import { HoneycombGrid } from "@/components/ui/honeycomb-grid"
import { FeedingQuickAddModal } from "@/components/feeding/FeedingQuickAddModal"
import { BottleContentType, FeedingType } from "@/types/feeding"
import * as Sentry from "@sentry/nextjs"

/** クイックアクションボタンの統一サイズ（六角形の高さ） */
const BUTTON_SIZE = 58

interface Props {
    babyId: string
    mutateRecords?: () => void
    records?: BabyRecord[]
}

export function QuickActionBar({ babyId, mutateRecords, records }: Props) {
    const router = useRouter()
    const { canWrite, executeRecord } = useQuickRecord(babyId, { onSuccess: mutateRecords })
    const [loadingAction, setLoadingAction] = useState<string | null>(null)
    const [noteDialogOpen, setNoteDialogOpen] = useState(false)
    const [feedingModalType, setFeedingModalType] = useState<FeedingType | null>(null)

    const activeSleep = useMemo(() => {
        return records?.find(r => r.type === 'sleep' && !r.details?.end_time)
    }, [records])

    // 前回のミルク量・種類を取得（モーダルのデフォルト値として使用）
    const { lastMilkAmount, lastBottleContentType } = useMemo(() => {
        const milkRecord = records?.find(r => {
            if (r.type !== 'feeding') return false
            const ft = r.details?.feeding_type
            if (ft !== 'BOTTLE' && ft !== 'MIXED') return false
            const amount = Number(r.details?.amount_ml)
            return amount > 0
        })
        return {
            lastMilkAmount: milkRecord ? Number(milkRecord.details?.amount_ml) : null,
            lastBottleContentType: (milkRecord?.details?.bottle_content_type as BottleContentType | null) ?? null,
        }
    }, [records])

    if (!canWrite) return null

    const handleFeedingModal = (type: FeedingType) => {
        setFeedingModalType(type)
    }

    const handleQuickRecord = async (type: "sleep" | "diaper_wet" | "diaper_dirty") => {
        Sentry.logger.info("Quick action started", { type })
        setLoadingAction(type)

        const actionMap = {
            "sleep": async () => {
                if (activeSleep) {
                    await api.patch(`/sleeps/${activeSleep.id}`, { end_time: new Date().toISOString() })
                    return { id: activeSleep.id }
                } else {
                    return api.post<{ id: number }>("/sleeps/", {
                        baby_id: Number(babyId),
                        start_time: new Date().toISOString(),
                    })
                }
            },
            "diaper_wet": async () => api.post<{ id: number }>("/diapers/", {
                baby_id: Number(babyId),
                diaper_type: "WET",
                change_time: new Date().toISOString(),
            }),
            "diaper_dirty": async () => api.post<{ id: number }>("/diapers/", {
                baby_id: Number(babyId),
                diaper_type: "DIRTY",
                change_time: new Date().toISOString(),
            }),
        }

        const configMap = {
            "sleep": { label: activeSleep ? "睡眠終了" : "睡眠開始" },
            "diaper_wet": { feedbackType: "diaper" as const, label: "おしっこ" },
            "diaper_dirty": { feedbackType: "diaper" as const, label: "うんち" },
        }

        await executeRecord(actionMap[type], configMap[type])
        Sentry.logger.info("Quick action completed", { type })
        setLoadingAction(null)
    }

    const isLoading = loadingAction !== null

    return (
        <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-[340px]">
            <div className="pointer-events-auto">
                {/* 3-2-3 ハニカム配置 */}
                <HoneycombGrid
                    size={BUTTON_SIZE}
                    gap={4}
                    rows={[
                        [0, 1, 2], // 上段: ミルク, 睡眠, 母乳
                        [3, 4],    // 中段: おしっこ, うんち
                        [5, 6, 7]  // 下段: メモ, 成長, 日誌
                    ]}
                >
                    {/* 上段: ミルク */}
                    <HexagonButton
                        variant="rose"
                        icon={<AppIcons.feedingBottle className="h-5 w-5" />}
                        size={BUTTON_SIZE}
                        onClick={() => handleFeedingModal("BOTTLE")}
                        disabled={isLoading}
                        aria-label="ミルクを記録"
                        animationType="tilt"
                    />
                    {/* 上段: 睡眠（中央・メイン） */}
                    <HexagonButton
                        variant="indigo"
                        icon={activeSleep ? <AppIcons.sleepActive className="h-6 w-6" /> : <AppIcons.sleep className="h-6 w-6" />}
                        size={BUTTON_SIZE}
                        active={!!activeSleep}
                        onClick={() => handleQuickRecord("sleep")}
                        loading={loadingAction === "sleep"}
                        disabled={isLoading}
                        aria-label={activeSleep ? " 睡眠終了を記録" : "睡眠開始を記録"}
                        animationType="tilt"
                    />
                    {/* 上段: 母乳 */}
                    <HexagonButton
                        variant="rose"
                        icon={<AppIcons.feedingBreast className="h-5 w-5" />}
                        size={BUTTON_SIZE}
                        onClick={() => handleFeedingModal("BREAST")}
                        disabled={isLoading}
                        aria-label="母乳を記録"
                        animationType="tilt"
                    />
                    {/* 中段: おしっこ */}
                    <HexagonButton
                        variant="amber"
                        icon={<AppIcons.diaperWet className="h-5 w-5" />}
                        size={BUTTON_SIZE}
                        onClick={() => handleQuickRecord("diaper_wet")}
                        loading={loadingAction === "diaper_wet"}
                        disabled={isLoading}
                        aria-label="おしっこを記録"
                        animationType="bounce"
                    />
                    {/* 中段: うんち */}
                    <HexagonButton
                        variant="amber"
                        icon={<AppIcons.diaperDirty className="h-5 w-5" />}
                        size={BUTTON_SIZE}
                        onClick={() => handleQuickRecord("diaper_dirty")}
                        loading={loadingAction === "diaper_dirty"}
                        disabled={isLoading}
                        aria-label="うんちを記録"
                        animationType="bounce"
                    />
                    {/* 下段: メモ */}
                    <HexagonButton
                        variant="blue"
                        icon={<AppIcons.note className="h-5 w-5" />}
                        size={BUTTON_SIZE}
                        onClick={() => setNoteDialogOpen(true)}
                        disabled={isLoading}
                        aria-label="メモを追加"
                        animationType="tilt"
                    />
                    {/* 下段: 成長 */}
                    <HexagonButton
                        variant="emerald"
                        icon={<AppIcons.growth className="h-5 w-5" />}
                        size={BUTTON_SIZE}
                        onClick={() => router.push(`/growth`)}
                        disabled={isLoading}
                        aria-label="成長記録ページへ"
                        animationType="bounce"
                    />
                    {/* 下段: 日誌 */}
                    <HexagonButton
                        variant="purple"
                        icon={<AppIcons.diary className="h-5 w-5" />}
                        size={BUTTON_SIZE}
                        onClick={() => router.push(`/diary`)}
                        disabled={isLoading}
                        aria-label="日誌ページへ"
                        animationType="tilt"
                    />

                </HoneycombGrid>
            </div>

            <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                <DialogContent className="max-w-md w-[90%] rounded-2xl p-0 overflow-hidden border-0 dark:bg-zinc-950">
                    <DialogHeader className="p-4 pb-0">
                        <DialogTitle className="text-base font-semibold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                            <StickyNote className="h-4 w-4 text-blue-500" />
                            メモを追加
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-4">
                        <NoteForm
                            babyId={Number(babyId)}
                            defaultExpanded={true}
                            onAddSuccess={() => {
                                setNoteDialogOpen(false)
                                if (mutateRecords) mutateRecords()
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {feedingModalType && (
                <FeedingQuickAddModal
                    babyId={Number(babyId)}
                    feedingType={feedingModalType}
                    open={feedingModalType !== null}
                    onOpenChange={(open) => { if (!open) setFeedingModalType(null) }}
                    onSuccess={mutateRecords}
                    lastMilkAmount={lastMilkAmount}
                    lastBottleContentType={lastBottleContentType}
                />
            )}
        </div>
    )
}
