"use client"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { usePermissions } from "@/hooks/usePermissions"
import { BabyRecord } from "@/hooks/useData"
import { Moon, Bed } from "lucide-react"

interface Props {
    babyId: string
    mutateRecords?: () => void
    records?: BabyRecord[]
}

export function QuickActionBar({ babyId, mutateRecords, records }: Props) {
    const { canWrite } = usePermissions()
    const [loading, setLoading] = useState(false)

    const activeSleep = useMemo(() => {
        return records?.find(r => r.type === 'sleep' && !r.details?.end_time)
    }, [records])

    if (!canWrite) return null

    const handleQuickRecord = async (type: "feeding_bottle" | "feeding_breast" | "sleep" | "diaper_wet" | "diaper_dirty") => {
        setLoading(true)
        try {
            if (type === "feeding_bottle" || type === "feeding_breast") {
                await api.post("/feedings/", {
                    baby_id: Number(babyId),
                    feeding_type: type === "feeding_bottle" ? "BOTTLE" : "BREAST",
                    feeding_time: new Date().toISOString(),
                })
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
                await api.post("/diapers/", {
                    baby_id: Number(babyId),
                    condition: type === "diaper_wet" ? "WET" : "DIRTY",
                    recorded_at: new Date().toISOString(),
                })
            }
            if (mutateRecords) mutateRecords()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-sm:max-w-[320px] max-w-sm">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800 p-2 flex justify-around items-center transition-all duration-300">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex flex-col items-center justify-center gap-1"
                    onClick={() => handleQuickRecord("feeding_bottle")}
                    disabled={loading}
                    title="ミルク記録"
                >
                    <span className="text-xl">🍼</span>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-12 w-12 rounded-xl text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex flex-col items-center justify-center gap-1 ${activeSleep ? "animate-pulse" : ""}`}
                    onClick={() => handleQuickRecord("sleep")}
                    disabled={loading}
                    title={activeSleep ? '睡眠終了' : '睡眠開始'}
                >
                    {activeSleep ? <Bed className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                </Button>
                <div className="w-px h-8 bg-gray-200 dark:bg-zinc-700 mx-1" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex flex-col items-center justify-center gap-1"
                    onClick={() => handleQuickRecord("diaper_wet")}
                    disabled={loading}
                    title="おしっこ記録"
                >
                    <span className="text-xl">💧</span>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex flex-col items-center justify-center gap-1"
                    onClick={() => handleQuickRecord("diaper_dirty")}
                    disabled={loading}
                    title="うんち記録"
                >
                    <span className="text-xl">💩</span>
                </Button>
            </div>
        </div>
    )
}
