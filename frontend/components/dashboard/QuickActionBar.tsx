"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useQuickRecord } from "@/hooks/useQuickRecord"
import { BabyRecord } from "@/types/record"
import { AppIcons } from "@/constants/icons"
import { StickyNote } from "lucide-react" // keep StickyNote for dialog title
import { EditDialogBase } from "@/components/records/EditDialogBase"
import { NoteForm } from "@/components/note/NoteForm"
import { HexagonButton } from "@/components/ui/hexagon-button"
import { HoneycombGrid } from "@/components/ui/honeycomb-grid"
import { FeedingQuickAddModal } from "@/components/feeding/FeedingQuickAddModal"
import { DiaperQuickAddModal } from "@/components/diaper/DiaperQuickAddModal"
import { BottleContentType, FeedingType } from "@/types/feeding"
import { DiaperType } from "@/types/diaper"
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
    const [diaperModalType, setDiaperModalType] = useState<DiaperType | null>(null)

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

    const handleDiaperModal = (type: DiaperType) => {
        setDiaperModalType(type)
    }

    const handleSleep = async () => {
        Sentry.logger.info("Quick action started", { type: "sleep" })
        setLoadingAction("sleep")
        await executeRecord(
            async () => {
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
            { label: activeSleep ? "睡眠終了" : "睡眠開始" }
        )
        Sentry.logger.info("Quick action completed", { type: "sleep" })
        setLoadingAction(null)
    }

    const isLoading = loadingAction !== null

    const buttons = [
        // 上段
        { variant: "rose", icon: <AppIcons.feedingBreast className="h-5 w-5" />, onClick: () => handleFeedingModal("BREAST"), ariaLabel: "母乳を記録", ariaHasPopup: "dialog" as const, animationType: "tilt" },
        { variant: "rose", icon: <AppIcons.feedingBottle className="h-5 w-5" />, onClick: () => handleFeedingModal("BOTTLE"), ariaLabel: "ミルクを記録", ariaHasPopup: "dialog" as const, animationType: "tilt" },
        // 中段
        { variant: "amber", icon: <AppIcons.diaperWet className="h-5 w-5" />, onClick: () => handleDiaperModal(DiaperType.WET), ariaLabel: "おしっこを記録", ariaHasPopup: "dialog" as const, animationType: "bounce" },
        { variant: "amber", icon: <AppIcons.diaperDirty className="h-5 w-5" />, onClick: () => handleDiaperModal(DiaperType.DIRTY), ariaLabel: "うんちを記録", ariaHasPopup: "dialog" as const, animationType: "bounce" },
        { variant: "amber", icon: <span className="flex gap-0.5"><AppIcons.diaperWet className="h-4 w-4" /><AppIcons.diaperDirty className="h-4 w-4" /></span>, onClick: () => handleDiaperModal(DiaperType.BOTH), ariaLabel: "おしっこ・うんちを記録", ariaHasPopup: "dialog" as const, animationType: "bounce" },
        // 下段
        { variant: "indigo", icon: activeSleep ? <AppIcons.sleepActive className="h-6 w-6" /> : <AppIcons.sleep className="h-6 w-6" />, active: !!activeSleep, onClick: handleSleep, loading: loadingAction === "sleep", ariaLabel: activeSleep ? "睡眠終了を記録" : "睡眠開始を記録", ariaHasPopup: undefined, animationType: "tilt" },
        { variant: "emerald", icon: <AppIcons.growth className="h-5 w-5" />, onClick: () => router.push(`/growth`), ariaLabel: "成長記録ページへ", ariaHasPopup: undefined, animationType: "bounce" },
        { variant: "blue", icon: <AppIcons.note className="h-5 w-5" />, onClick: () => setNoteDialogOpen(true), ariaLabel: "メモを追加", ariaHasPopup: "dialog" as const, animationType: "tilt" },
        { variant: "purple", icon: <AppIcons.diary className="h-5 w-5" />, onClick: () => router.push(`/diary`), ariaLabel: "日誌ページへ", ariaHasPopup: undefined, animationType: "tilt" }
    ] as const;

    return (
        <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-[360px]">
            <div className="pointer-events-auto">
                {/* 2-3-4 ハニカム配置 */}
                <HoneycombGrid
                    size={BUTTON_SIZE}
                    gap={4}
                    rows={[
                        [0, 1],       // 上段: 授乳, ミルク
                        [2, 3, 4],    // 中段: おしっこ, うんち, おしっこ/うんち
                        [5, 6, 7, 8]  // 下段: 睡眠, 成長, メモ, 日誌
                    ]}
                >
                    {buttons.map((btn, index) => (
                        <HexagonButton
                            key={index}
                            variant={btn.variant}
                            icon={btn.icon}
                            size={BUTTON_SIZE}
                            active={'active' in btn ? btn.active : undefined}
                            onClick={btn.onClick}
                            loading={'loading' in btn ? btn.loading : undefined}
                            disabled={isLoading}
                            aria-label={btn.ariaLabel}
                            aria-haspopup={btn.ariaHasPopup}
                            animationType={btn.animationType as "tilt" | "bounce"}
                        />
                    ))}
                </HoneycombGrid>
            </div>

            <EditDialogBase
                open={noteDialogOpen}
                onOpenChange={setNoteDialogOpen}
                title={
                    <span className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-zinc-100">
                        <StickyNote className="h-4 w-4 text-blue-500" />
                        メモを追加
                    </span>
                }
            >
                <div className="pt-2">
                    <NoteForm
                        babyId={Number(babyId)}
                        defaultExpanded={true}
                        onAddSuccess={() => {
                            setNoteDialogOpen(false)
                            if (mutateRecords) mutateRecords()
                        }}
                    />
                </div>
            </EditDialogBase>

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

            {diaperModalType && (
                <DiaperQuickAddModal
                    babyId={Number(babyId)}
                    defaultDiaperType={diaperModalType}
                    open={diaperModalType !== null}
                    onOpenChange={(open) => { if (!open) setDiaperModalType(null) }}
                    onSuccess={mutateRecords}
                />
            )}
        </div>
    )
}
