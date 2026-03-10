import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"
import { UI_FORMS } from "@/constants/ui-colors"
import { cn } from "@/lib/utils"
import { BreastSide } from "@/types/feeding"

interface FeedingTimerSectionProps {
    leftSeconds: number
    rightSeconds: number
    activeBreastSide: BreastSide | null
    totalSeconds: number
    formatTimer: (seconds: number) => string
    toggleTimer: (side: "LEFT" | "RIGHT") => void
    resetAllTimers: () => void
}

export function FeedingTimerSection({
    leftSeconds,
    rightSeconds,
    activeBreastSide,
    totalSeconds,
    formatTimer,
    toggleTimer,
    resetAllTimers
}: FeedingTimerSectionProps) {
    return (
        <div className={cn(UI_FORMS.timer.rose.container, "p-4 rounded-lg space-y-3 transition-colors")}>
            <div className="grid grid-cols-2 gap-3">
                <div className="text-center space-y-2">
                    <p className={cn("text-xs font-medium", UI_FORMS.timer.rose.title)}>左乳</p>
                    <div className={cn("text-2xl font-mono font-bold", UI_FORMS.timer.rose.timer)}>
                        {formatTimer(leftSeconds)}
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        variant={activeBreastSide === "LEFT" ? "outline" : "default"}
                        className={activeBreastSide === "LEFT"
                            ? cn("w-full", UI_FORMS.timer.rose.buttonActive)
                            : cn("w-full", UI_FORMS.timer.rose.buttonInactive)}
                        onClick={() => toggleTimer("LEFT")}
                        aria-label={activeBreastSide === "LEFT" ? "左乳のタイマーを一時停止" : "左乳のタイマーを開始"}
                    >
                        {activeBreastSide === "LEFT"
                            ? <><Pause className="mr-1 h-3 w-3" />一時停止</>
                            : <><Play className="mr-1 h-3 w-3" />開始</>
                        }
                    </Button>
                </div>
                <div className="text-center space-y-2">
                    <p className={cn("text-xs font-medium", UI_FORMS.timer.rose.title)}>右乳</p>
                    <div className={cn("text-2xl font-mono font-bold", UI_FORMS.timer.rose.timer)}>
                        {formatTimer(rightSeconds)}
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        variant={activeBreastSide === "RIGHT" ? "outline" : "default"}
                        className={activeBreastSide === "RIGHT"
                            ? cn("w-full", UI_FORMS.timer.rose.buttonActive)
                            : cn("w-full", UI_FORMS.timer.rose.buttonInactive)}
                        onClick={() => toggleTimer("RIGHT")}
                        aria-label={activeBreastSide === "RIGHT" ? "右乳のタイマーを一時停止" : "右乳のタイマーを開始"}
                    >
                        {activeBreastSide === "RIGHT"
                            ? <><Pause className="mr-1 h-3 w-3" />一時停止</>
                            : <><Play className="mr-1 h-3 w-3" />開始</>
                        }
                    </Button>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <p className={cn("text-xs font-medium", UI_FORMS.timer.rose.totalText)}>
                    合計: {formatTimer(totalSeconds)}
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={resetAllTimers} className="h-7 text-xs">
                    <RotateCcw className="h-3 w-3 mr-1 text-gray-500 dark:text-zinc-400" />
                    リセット
                </Button>
            </div>
        </div>
    )
}
