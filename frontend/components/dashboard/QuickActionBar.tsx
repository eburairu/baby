"use client"
import { RECORD_TYPES } from '@/types/enums';

import { useState, useMemo } from "react"
import { api } from "@/lib/api"
import { useQuickRecord } from "@/hooks/useQuickRecord"
import { BabyRecord } from "@/types/record"
import { Moon, Bed, StickyNote, Milk, Baby, Biohazard } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NoteForm } from "@/components/note/NoteForm"
import { HexagonButton } from "@/components/ui/hexagon-button"
import { HoneycombGrid } from "@/components/ui/honeycomb-grid"

interface Props {
    babyId: string
    mutateRecords?: () => void
    records?: BabyRecord[]
}

export function QuickActionBar({ babyId, mutateRecords, records }: Props) {
    const { canWrite, executeRecord } = useQuickRecord(babyId, { onSuccess: mutateRecords })
    const [loadingAction, setLoadingAction] = useState<string | null>(null)
    const [noteDialogOpen, setNoteDialogOpen] = useState(false)

    const activeSleep = useMemo(() => {
        return records?.find(r => r.type === 'sleep' && !r.details?.end_time)
    }, [records])

    if (!canWrite) return null

    const handleQuickRecord = async (type: "feeding_bottle" | "feeding_breast" | "sleep" | "diaper_wet" | "diaper_dirty") => {
        setLoadingAction(type)
        
        const actionMap = {
            "feeding_bottle": async () => api.post<{ id: number }>("/feedings/", {
                baby_id: Number(babyId),
                feeding_type: "BOTTLE",
                feeding_time: new Date().toISOString(),
            }),
            "feeding_breast": async () => api.post<{ id: number }>("/feedings/", {
                baby_id: Number(babyId),
                feeding_type: "BREAST",
                feeding_time: new Date().toISOString(),
            }),
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
            "feeding_bottle": { feedbackType: RECORD_TYPES.FEEDING, label: "ミルク" },
            "feeding_breast": { feedbackType: RECORD_TYPES.FEEDING, label: "母乳" },
            "sleep": { label: activeSleep ? "睡眠終了" : "睡眠開始" },
            "diaper_wet": { feedbackType: "diaper" as const, label: "おしっこ" },
            "diaper_dirty": { feedbackType: "diaper" as const, label: "うんち" },
        }

        await executeRecord(actionMap[type], configMap[type])
        setLoadingAction(null)
    }

    return (
        <div className="fixed bottom-[calc(2.5rem+env(safe-area-inset-bottom))] md:bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-[320px]">
            <div className="pointer-events-auto">
                <HoneycombGrid 
                  size={64} 
                  gap={4}
                  rows={[
                    [0, 1, 2], // ミルク, 睡眠, メモ
                    [3, 4]     // おしっこ, うんち
                  ]}
                >
                    <HexagonButton
                        variant="rose"
                        icon={<Milk className="h-6 w-6" />}
                        size={64}
                        onClick={() => handleQuickRecord("feeding_bottle")}
                        loading={loadingAction === "feeding_bottle"}
                        aria-label="ミルクを記録"
                    />
                    <HexagonButton
                        variant="indigo"
                        icon={activeSleep ? <Bed className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                        size={68} // 睡眠ボタンを少しだけ大きく
                        active={!!activeSleep}
                        onClick={() => handleQuickRecord("sleep")}
                        loading={loadingAction === "sleep"}
                        aria-label={activeSleep ? "睡眠終了を記録" : "睡眠開始を記録"}
                    />
                    <HexagonButton
                        variant="amber"
                        icon={<StickyNote className="h-6 w-6" />}
                        size={64}
                        onClick={() => setNoteDialogOpen(true)}
                        aria-label="メモを追加"
                    />
                    <HexagonButton
                        variant="amber"
                        icon={<Baby className="h-6 w-6" />}
                        size={64}
                        onClick={() => handleQuickRecord("diaper_wet")}
                        loading={loadingAction === "diaper_wet"}
                        aria-label="おしっこを記録"
                    />
                    <HexagonButton
                        variant="amber"
                        icon={<Biohazard className="h-6 w-6" />}
                        size={64}
                        onClick={() => handleQuickRecord("diaper_dirty")}
                        loading={loadingAction === "diaper_dirty"}
                        aria-label="うんちを記録"
                    />
                </HoneycombGrid>
            </div>

            <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                <DialogContent className="max-w-md w-[90%] rounded-2xl p-0 overflow-hidden border-0 dark:bg-zinc-950">
                    <DialogHeader className="p-4 pb-0">
                        <DialogTitle className="text-base font-semibold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                            <StickyNote className="h-4 w-4 text-amber-500" />
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
        </div>
    )
}
