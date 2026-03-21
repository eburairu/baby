"use client"
import React from "react"
import { BabyRecord } from "@/types/record"
import { formatElapsed } from "@/lib/ageUtils"
import { formatDateTime } from "@/lib/dateUtils"
import { MessageCircle, User, StickyNote, Bot, TriangleAlert } from "lucide-react"
import { RECORD_TYPE_LABELS, RECORD_TYPE_LUCIDE_ICONS, RECORD_TYPE_COLORS, RECORD_TYPE_BG_COLORS } from "@/constants/ui"
import { AppIcons } from "@/constants/icons"
import { Hexagon } from "@/components/ui/hexagon"
import { cn } from "@/lib/utils"

/**
 * ダッシュボードのアクティビティフィードに表示される個々の記録項目コンポーネント
 */
interface ActivityItemProps {
    record: BabyRecord
    onClick: (record: BabyRecord) => void
}

export const ActivityItem = React.memo(function ActivityItem({ record, onClick }: ActivityItemProps) {
    const recordType = record.type as keyof typeof RECORD_TYPE_LABELS
    const label = RECORD_TYPE_LABELS[recordType] || record.type
    const colorClass = RECORD_TYPE_COLORS[recordType as keyof typeof RECORD_TYPE_COLORS] || 'text-muted-foreground'
    const bgColorClass = RECORD_TYPE_BG_COLORS[recordType] || 'text-gray-100 dark:text-zinc-800'

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
                aria-haspopup="dialog"
                aria-label={`${label}の詳細を表示`}
                className="w-full flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 active:bg-gray-100 dark:active:bg-zinc-700 p-1 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400"
                onClick={() => onClick(record)}
            >
                <Hexagon size={36} cornerRadius={6} className={cn("shrink-0", bgColorClass)}>
                    <IconComponent className={cn("h-4 w-4", colorClass)} aria-hidden="true" />
                </Hexagon>
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
                        {record.has_ai_concern ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700">
                                <TriangleAlert className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                                    AI要確認
                                </span>
                            </span>
                        ) : record.has_ai_feedback ? (
                            <span className="inline-flex items-center gap-1">
                                <Bot className="w-3 h-3 text-indigo-400" />
                                <span className="text-[10px] font-medium text-indigo-500 dark:text-indigo-400">
                                    AIフィードバック
                                </span>
                            </span>
                        ) : null}
                        {record.comment_count > 0 ? (
                            <span className="inline-flex items-center gap-1">
                                <MessageCircle className="w-3 h-3 text-orange-400" />
                                <span className="text-[10px] font-medium text-orange-500">
                                    {record.comment_count}件
                                </span>
                            </span>
                        ) : null}
                    </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs text-gray-400 dark:text-zinc-500 whitespace-nowrap">
                        {formatDateTime(record.timestamp)}
                    </span>
                    <span className="text-[10px] text-gray-300 dark:text-zinc-600 whitespace-nowrap">
                        {formatElapsed(record.timestamp)}
                    </span>
                </div>
            </button>
        </li>
    )
})
