"use client"

import { Thermometer } from "lucide-react"
import { Temperature, getFeverStatus, TEMPERATURE_METHOD_LABELS } from "@/types/temperature"
import { formatDateTime } from "@/lib/dateUtils"
import { cn } from "@/lib/utils"
import { GenericRecordHistory } from "@/components/records/GenericRecordHistory"
import { TemperatureEditDialog } from "./TemperatureEditDialog"

interface Props {
    temperatures: Temperature[]
    onDelete: (id: number) => Promise<void>
    onRefresh: () => void
    canWrite?: boolean
    initialCommentRecordId?: number | null
}

function FeverBadge({ temp }: { temp: number }) {
    const status = getFeverStatus(temp)
    if (status === "normal") return null
    return (
        <span
            className={cn(
                "ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                status === "high_fever"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
            )}
        >
            {status === "high_fever" ? "高熱" : "発熱"}
        </span>
    )
}

export function TemperatureHistory({
    temperatures,
    onDelete,
    onRefresh,
    canWrite = true,
    initialCommentRecordId,
}: Props) {
    return (
        <GenericRecordHistory<Temperature>
            records={temperatures}
            recordType="temperature"
            resourceName="体温記録"
            canWrite={canWrite}
            initialCommentRecordId={initialCommentRecordId}
            onRefresh={onRefresh}
            onDelete={onDelete}
            getCommentTitle={(t) =>
                `${t.temperature.toFixed(1)}°C ${formatDateTime(t.measured_at)}`
            }
            itemClassName={() =>
                "bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-800/30"
            }
            renderIcon={() => (
                <Thermometer className="w-4 h-4 text-orange-500 dark:text-orange-400" />
            )}
            renderTitle={(t) => (
                <div className="text-sm font-bold text-orange-700 dark:text-orange-400">
                    {t.temperature.toFixed(1)}°C
                    <FeverBadge temp={t.temperature} />
                    <span className="text-xs font-normal text-gray-500 dark:text-zinc-500 ml-2">
                        {TEMPERATURE_METHOD_LABELS[t.method]}
                    </span>
                    <span className="text-xs font-normal text-gray-500 dark:text-zinc-500 ml-2">
                        {formatDateTime(t.measured_at)}
                    </span>
                </div>
            )}
            renderDetails={(t) =>
                t.notes ? (
                    <div className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">
                        {t.notes}
                    </div>
                ) : null
            }
            renderEditDialog={(target, open, setOpen) => (
                <TemperatureEditDialog
                    temperature={target}
                    open={open}
                    onOpenChange={setOpen}
                    onSuccess={() => {
                        setOpen(false)
                        onRefresh()
                    }}
                />
            )}
        />
    )
}
