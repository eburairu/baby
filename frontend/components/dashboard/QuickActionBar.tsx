"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { usePermissions } from "@/hooks/usePermissions"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"
import { Moon, Smile } from "lucide-react"

interface Props {
    babyId: string
    mutateRecords?: () => void
}

export function QuickActionBar({ babyId, mutateRecords }: Props) {
    const { canWrite } = usePermissions()
    const [loading, setLoading] = useState(false)

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
                // To properly start/stop sleep, we need to know current state, 
                // but as a generic quick action, let's just trigger a sleep start if possible, 
                // or redirect to the sleep page. Since SleepWidget already handles start/stop with state,
                // making a fully functional start/stop here requires fetching the latest sleep state.
                // For simplicity, we can use the same logic as SleepWidget or just log a generic "started" 
                // However, without state it's tricky. Let's redirect to pages or use simple posts.
                // Actually, let's keep it simple: redirect to detail pages or trigger Quick API.
                window.location.href = `/sleep?baby_id=${babyId}`
                return
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

    // A better approach for QuickActionBar is to have icons that trigger immediate common actions.
    // 🍼 (ミルク/母乳) | 💤 (睡眠) | 💧 (おしっこ) | 💩 (うんち)
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800 p-2 flex justify-around items-center transition-all duration-300">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex flex-col items-center justify-center gap-1"
                    onClick={() => handleQuickRecord("feeding_bottle")}
                    disabled={loading}
                >
                    <span className="text-xl">🍼</span>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex flex-col items-center justify-center gap-1"
                    onClick={() => handleQuickRecord("sleep")}
                    disabled={loading}
                >
                    <Moon className="h-6 w-6" />
                </Button>
                <div className="w-px h-8 bg-gray-200 dark:bg-zinc-700 mx-1" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex flex-col items-center justify-center gap-1"
                    onClick={() => handleQuickRecord("diaper_wet")}
                    disabled={loading}
                >
                    <span className="text-xl">💧</span>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex flex-col items-center justify-center gap-1"
                    onClick={() => handleQuickRecord("diaper_dirty")}
                    disabled={loading}
                >
                    <span className="text-xl">💩</span>
                </Button>
            </div>
        </div>
    )
}
