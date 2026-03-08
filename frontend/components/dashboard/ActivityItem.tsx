"use client"
import React from "react"
import { BabyRecord } from "@/types/record"
import { formatElapsed } from "@/lib/ageUtils"
import { MessageCircle, User, StickyNote } from "lucide-react"
import { RECORD_TYPE_LABELS, RECORD_TYPE_LUCIDE_ICONS } from "@/constants/ui"
import { AppIcons } from "@/constants/icons"
import { RecordIcon, RecordType } from "@/components/records/RecordIcon"

interface ActivityItemProps {
    record: BabyRecord
    onClick: (record: BabyRecord) => void
    /**
     * React.memoの再レンダリングをトリガーするためのダミープロップ。
     * 時間経過（formatElapsed）を定期的に更新するために使用されます。
     */
    tick: number
}

export const ActivityItem = React.memo(function ActivityItem({ record, onClick }: ActivityItemProps) {
    const recordType = record.type as keyof typeof RECORD_TYPE_LABELS
    const label = RECORD_TYPE_LABELS[recordType] || record.type

    let LucideIcon = RECORD_TYPE_LUCIDE_ICONS[recordType]

    // 授乳の場合は詳細タイプに応じてアイコンを切り替え
    if (recordType === 'feeding') {
        const feedingType = record.details?.feeding_type
        if (feedingType === 'BREAST') {
            LucideIcon = AppIcons.feedingBreast
        } else if (feedingType === 'BOTTLE') {
            LucideIcon = AppIcons.feedingBottle
        }
    }

    const IconComponent = LucideIcon ?? StickyNote

    return (
        <li>
            <button
                type="button"
                aria-label={`${label}の詳細を表示`}
                className="w-full flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 active:bg-gray-100 dark:active:bg-zinc-700 p-1 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400"
                onClick={() => onClick(record)}
            >
                <RecordIcon type={recordType as RecordType} icon={IconComponent} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">
                        {label}
                    </p>
                    {record.details.notes ? (
                        <p className="text-xs text-gray-400 dark:text-zinc-500 line-clamp-2">{record.details.notes}</p>
                    ) : null}
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        {record.recorded_by_display_name ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-zinc-500">
                                <User className="w-3 h-3" />
                                {record.recorded_by_display_name}
                            </span>
                        ) : null}
                        {record.comment_count > 0 ? (
                            <span className="inline-flex items-center gap-1">
                                <MessageCircle className="w-3 h-3 text-orange-400" />
                                <span className="text-[10px] font-medium text-orange-500">
                                    {record.comment_count}件のメッセージ
                                </span>
                            </span>
                        ) : null}
                    </div>
                </div>
                <span className="text-xs text-gray-400 dark:text-zinc-500 whitespace-nowrap">
                    {formatElapsed(record.timestamp)}
                </span>
            </button>
        </li>
    )
})
