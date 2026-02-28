"use client"
import React from "react"
import { BabyRecord } from "@/types/record"
import { formatElapsed } from "@/lib/ageUtils"
import { StickyNote } from "lucide-react"
import { RECORD_TYPE_LABELS, RECORD_TYPE_LUCIDE_ICONS } from "@/constants/ui"
import { RecordMetaItems } from "@/components/records/RecordMetaItems"

interface ActivityItemProps {
    record: BabyRecord
    onClick: (record: BabyRecord) => void
}

export const ActivityItem = React.memo(function ActivityItem({ record, onClick }: ActivityItemProps) {
    const recordType = record.type as keyof typeof RECORD_TYPE_LABELS
    const label = RECORD_TYPE_LABELS[recordType] || record.type
    const LucideIcon = RECORD_TYPE_LUCIDE_ICONS[recordType]

    return (
        <li>
            <button
                type="button"
                aria-label={`${label}の詳細を表示`}
                className="w-full flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 p-1 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400"
                onClick={() => onClick(record)}
            >
                {LucideIcon
                    ? <LucideIcon className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
                    : <StickyNote className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
                }
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">
                        {label}
                    </p>
                    {record.details.notes ? (
                        <p className="text-xs text-gray-400 dark:text-zinc-500 line-clamp-2">{record.details.notes}</p>
                    ) : null}
                    <RecordMetaItems
                        displayName={record.recorded_by_display_name}
                        commentCount={record.comment_count}
                        className="mt-0.5"
                    />
                </div>
                <span className="text-xs text-gray-400 dark:text-zinc-500 whitespace-nowrap">
                    {formatElapsed(record.timestamp)}
                </span>
            </button>
        </li>
    )
})
