"use client"
import { RECORD_TYPES } from '@/types/enums';

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { usePermissions } from "@/hooks/usePermissions"
import { BabyRecord } from "@/types/record"
import { Moon, Bed, Loader2, StickyNote } from "lucide-react"
import { useRecordFeedback } from "@/hooks/useRecordFeedback"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NoteForm } from "@/components/note/NoteForm"
import { toast } from "sonner"

interface Props {
    babyId: string
    mutateRecords?: () => void
    records?: BabyRecord[]
}

export function QuickActionBar({ babyId, mutateRecords, records }: Props) {
    const { canWrite } = usePermissions()
    const [loadingAction, setLoadingAction] = useState<string | null>(null)
    const [noteDialogOpen, setNoteDialogOpen] = useState(false)
    const { triggerFeedback } = useRecordFeedback(babyId)

    const activeSleep = useMemo(() => {
        return records?.find(r => r.type === 'sleep' && !r.details?.end_time)
    }, [records])

    if (!canWrite) return null

    const handleQuickRecord = async (type: "feeding_bottle" | "feeding_breast" | "sleep" | "diaper_wet" | "diaper_dirty") => {
        setLoadingAction(type)
        try {
            if (type === "feeding_bottle" || type === "feeding_breast") {
                const record = await api.post<{ id: number }>("/feedings/", {
                    baby_id: Number(babyId),
                    feeding_type: type === "feeding_bottle" ? "BOTTLE" : "BREAST",
                    feeding_time: new Date().toISOString(),
                })
                triggerFeedback(RECORD_TYPES.FEEDING, record.id)
            } else if (type === "sleep") {
                if (activeSleep) {
                    await api.patch(`/sleeps/${activeSleep.id}`, {
                        end_time: new Date().toISOString(),
                    })
                } else {
                    await api.post("/sleeps/", {
                        baby_id: Number(babyId),
                        start_time: new Date().toISOString(),
                    })
                }
            } else if (type === "diaper_wet" || type === "diaper_dirty") {
                const record = await api.post<{ id: number }>("/diapers/", {
                    baby_id: Number(babyId),
                    diaper_type: type === "diaper_wet" ? "WET" : "DIRTY",
                    change_time: new Date().toISOString(),
                })
                triggerFeedback("diaper", record.id)
            }
            if (mutateRecords) mutateRecords()
        } catch (e) {
            console.error(e)
            toast.error("記録に失敗しました")
        } finally {
            setLoadingAction(null)
        }
    }

    return (
        <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-sm:max-w-[320px] max-w-sm">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800 p-2 flex justify-around items-center transition-all duration-300">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex flex-col items-center justify-center gap-1"
                    onClick={() => handleQuickRecord("feeding_bottle")}
                    disabled={loadingAction !== null}
                    title="ミルク記録"
                    aria-label="ミルクを記録"
                >
                    {loadingAction === "feeding_bottle" ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <span className="text-xl" role="img" aria-hidden="true">
                            🍼
                        </span>
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-12 w-12 rounded-xl text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex flex-col items-center justify-center gap-1 ${activeSleep ? "animate-pulse" : ""}`}
                    onClick={() => handleQuickRecord("sleep")}
                    disabled={loadingAction !== null}
                    title={activeSleep ? '睡眠終了' : '睡眠開始'}
                    aria-label={activeSleep ? '睡眠終了' : '睡眠開始'}
                >
                    {loadingAction === "sleep" ? (
                        <Loader2 className="animate-spin" />
                    ) : activeSleep ? (
                        <Bed className="h-6 w-6" />
                    ) : (
                        <Moon className="h-6 w-6" />
                    )}
                </Button>
                <div className="w-px h-8 bg-gray-200 dark:bg-zinc-700 mx-1" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex flex-col items-center justify-center gap-1"
                    onClick={() => handleQuickRecord("diaper_wet")}
                    disabled={loadingAction !== null}
                    title="おしっこ記録"
                    aria-label="おしっこを記録"
                >
                    {loadingAction === "diaper_wet" ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <span className="text-xl" role="img" aria-hidden="true">
                            💧
                        </span>
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex flex-col items-center justify-center gap-1"
                    onClick={() => handleQuickRecord("diaper_dirty")}
                    disabled={loadingAction !== null}
                    title="うんち記録"
                    aria-label="うんちを記録"
                >
                    {loadingAction === "diaper_dirty" ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <span className="text-xl" role="img" aria-hidden="true">
                            💩
                        </span>
                    )}
                </Button>
                <div className="w-px h-8 bg-gray-200 dark:bg-zinc-700 mx-1" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex flex-col items-center justify-center gap-1"
                    onClick={() => setNoteDialogOpen(true)}
                    disabled={loadingAction !== null}
                    title="メモ記録"
                    aria-label="メモを記録"
                    aria-haspopup="dialog"
                    aria-expanded={noteDialogOpen}
                >
                    <StickyNote className="h-6 w-6" />
                </Button>

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
        </div>
    )
}
