"use client"
import { RECORD_TYPES } from '@/types/enums';

import { useState, useMemo } from "react"
import { api } from "@/lib/api"
import { useQuickRecord } from "@/hooks/useQuickRecord"
import { BabyRecord } from "@/types/record"
import { Moon, Bed, StickyNote, Droplets, Baby, Biohazard } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NoteForm } from "@/components/note/NoteForm"
import { HexagonButton } from "@/components/ui/hexagon-button"

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
        <div className="fixed bottom-[calc(2rem+env(safe-area-inset-bottom))] md:bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
            <div className="flex flex-col items-center pointer-events-auto">
                {/* Honeycomb Row 1 */}
                <div className="flex justify-center -mb-2">
                    <HexagonButton
                        icon={<Droplets className="h-6 w-6" />}
                        size={60}
                        onClick={() => handleQuickRecord("feeding_bottle")}
                        loading={loadingAction === "feeding_bottle"}
                        className="mx-[-1px]"
                    />
                    <HexagonButton
                        icon={activeSleep ? <Bed className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                        size={64}
                        active={!!activeSleep}
                        onClick={() => handleQuickRecord("sleep")}
                        loading={loadingAction === "sleep"}
                        className="mx-[-1px] z-10"
                    />
                    <HexagonButton
                        icon={<StickyNote className="h-6 w-6" />}
                        size={60}
                        onClick={() => setNoteDialogOpen(true)}
                        className="mx-[-1px]"
                    />
                </div>
                
                {/* Honeycomb Row 2 */}
                <div className="flex justify-center">
                    <HexagonButton
                        icon={<Baby className="h-6 w-6" />}
                        size={60}
                        onClick={() => handleQuickRecord("diaper_wet")}
                        loading={loadingAction === "diaper_wet"}
                        className="mx-[-1px]"
                    />
                    <HexagonButton
                        icon={<Biohazard className="h-6 w-6" />}
                        size={60}
                        onClick={() => handleQuickRecord("diaper_dirty")}
                        loading={loadingAction === "diaper_dirty"}
                        className="mx-[-1px]"
                    />
                </div>
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
