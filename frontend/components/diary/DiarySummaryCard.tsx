"use client"

import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DailySummary } from "@/types/dailySummary"

interface DiarySummaryCardProps {
    summary: DailySummary
    onEdit: (summary: DailySummary) => void
    onDelete: (summary: DailySummary) => void
}

export function DiarySummaryCard({ summary, onEdit, onDelete }: DiarySummaryCardProps) {
    const dateLabel = new Date(summary.summary_date + "T00:00:00").toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
    })

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">{dateLabel}</span>
                <div className="flex items-center gap-2">
                    {summary.is_edited && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            ✏️ 編集済み
                        </Badge>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-blue-500"
                        onClick={() => onEdit(summary)}
                        aria-label="編集"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                        onClick={() => onDelete(summary)}
                        aria-label="削除"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {summary.display_content}
            </p>
        </div>
    )
}
