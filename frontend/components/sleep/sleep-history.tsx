"use client"

import { useMemo } from "react"
import { useSleeps } from "@/hooks/useSleep"

import { RecordIcon } from "@/components/records/RecordIcon"
import { formatDateTime, formatTime } from "@/lib/dateUtils"
import { api } from "@/lib/api"
import { Sleep } from "@/types/sleep"
import { formatDuration } from "@/lib/ageUtils"
import { SleepEditDialog } from "./SleepEditDialog"
import { GenericRecordHistory } from "@/components/records/GenericRecordHistory"

interface Props {
    babyId: number | string
    canWrite?: boolean
    initialCommentRecordId?: number | null
}

export function SleepHistory({ babyId, canWrite = true, initialCommentRecordId }: Props) {
    const { sleeps, mutate } = useSleeps(babyId)

    const history = useMemo(() => {
        return sleeps?.filter((s) => s.end_time).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    }, [sleeps])

    const handleDelete = async (id: number) => {
        await api.delete(`/sleeps/${id}`)
    }

    return (
        <GenericRecordHistory<Sleep>
            title="最近の睡眠"
            records={history || []}
            recordType="sleep"
            resourceName="睡眠記録"

            canWrite={canWrite}
            initialCommentRecordId={initialCommentRecordId}
            onRefresh={mutate}
            onDelete={handleDelete}
            getCommentTitle={(s) => `睡眠 ${formatDateTime(s.start_time)}`}
            renderIcon={() => <RecordIcon type="sleep" />}
            renderTitle={(sleep) => (
                <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-gray-900 dark:text-zinc-100">
                        {formatDateTime(sleep.start_time)}
                        <span className="text-gray-400 dark:text-zinc-500 mx-2">-</span>
                        {sleep.end_time ? formatTime(sleep.end_time) : "現在"}
                    </p>
                </div>
            )}
            renderMetaExtra={(sleep) => {
                const duration = sleep.end_time
                    ? formatDuration(sleep.start_time, sleep.end_time)
                    : "睡眠中"
                return (
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded text-slate-600 dark:text-zinc-400 font-medium text-[10px]">
                        {duration}
                    </span>
                )
            }}
            renderDetails={(sleep) => (
                sleep.notes ? (
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 line-clamp-1">
                        {sleep.notes}
                    </p>
                ) : null
            )}
            renderEditDialog={(target, open, setOpen) => (
                <SleepEditDialog
                    sleep={target}
                    open={open}
                    onOpenChange={setOpen}
                    onSuccess={mutate}
                />
            )}
        />
    )
}
