import { Thermometer } from "lucide-react"
import { Temperature, getFeverStatus } from "@/types/temperature"
import { StatsCard } from "@/components/ui/stats-card"
import { StatsBlock } from "@/components/ui/stats-block"
import { formatElapsed } from "@/lib/ageUtils"
import { cn } from "@/lib/utils"

interface Props {
    temperatures: Temperature[]
}

function FeverBadge({ temp }: { temp: number }) {
    const status = getFeverStatus(temp)
    if (status === "normal") return null

    return (
        <span
            className={cn(
                "ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full",
                status === "high_fever"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
            )}
        >
            {status === "high_fever" ? "高熱" : "発熱"}
        </span>
    )
}

export function TemperatureStats({ temperatures }: Props) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayTemps = temperatures.filter(
        (t) => new Date(t.measured_at) >= today
    )
    const maxTodayTemp = todayTemps.length > 0
        ? Math.max(...todayTemps.map((t) => t.temperature))
        : null

    const latest = temperatures[0] ?? null
    const latestElapsed = latest ? formatElapsed(latest.measured_at) : null

    return (
        <StatsCard>
            <div className="grid grid-cols-2 gap-4">
                <StatsBlock
                    icon={Thermometer}
                    label="直近の体温"
                    value={
                        latest ? (
                            <span className="flex items-center">
                                {latest.temperature.toFixed(1)}°C
                                <FeverBadge temp={latest.temperature} />
                            </span>
                        ) : "—"
                    }
                    color="amber"
                >
                    {latestElapsed && (
                        <p className="text-[10px] text-gray-500 dark:text-zinc-500">
                            {latestElapsed}
                        </p>
                    )}
                </StatsBlock>

                <StatsBlock
                    icon={Thermometer}
                    label="今日の最高体温"
                    value={
                        maxTodayTemp != null ? (
                            <span className="flex items-center">
                                {maxTodayTemp.toFixed(1)}°C
                                <FeverBadge temp={maxTodayTemp} />
                            </span>
                        ) : "—"
                    }
                    color="amber"
                >
                    <p className="text-[10px] text-gray-500 dark:text-zinc-500">
                        {todayTemps.length > 0 ? `${todayTemps.length}回測定` : "本日の記録なし"}
                    </p>
                </StatsBlock>
            </div>
        </StatsCard>
    )
}
