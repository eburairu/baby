"use client"
import { Button } from "@/components/ui/button"
import { Baby as BabyIcon, Pencil, Trash2, ExternalLink } from "lucide-react"
import { calcAge } from "@/lib/ageUtils"
import { SettingsCard } from "./SettingsCard"

import type { Baby } from "@/types/baby"

interface Props {
    baby: Baby
    isAdmin: boolean
    onEdit: (baby: Baby) => void
    onDelete: (baby: Baby) => void
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return ""
    return dateStr.replace(/-/g, "/")
}

export function BabyCard({ baby, isAdmin, onEdit, onDelete }: Props) {
    const age = baby.birthday ? calcAge(baby.birthday).label : ""

    return (
        <SettingsCard>
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-pink-500 dark:text-pink-400 font-semibold text-sm flex items-center gap-1"><BabyIcon className="w-4 h-4" /> {baby.name}</span>
                    </div>
                    {age && <p className="text-sm text-gray-600 dark:text-zinc-400">{age}</p>}
                    {baby.birthday && (
                        <p className="text-xs text-gray-500 dark:text-zinc-500">誕生日: {formatDate(baby.birthday)}</p>
                    )}
                    {baby.due_date && (
                        <p className="text-xs text-gray-500 dark:text-zinc-500">予定日: {formatDate(baby.due_date)}</p>
                    )}
                    {baby.instagram_username && (
                        <a
                            href={`https://www.instagram.com/${baby.instagram_username}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-pink-500 dark:text-pink-400 hover:underline mt-1"
                        >
                            <ExternalLink className="w-3 h-3" />
                            @{baby.instagram_username}
                        </a>
                    )}
                    {baby.characteristics && (
                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                            <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium mb-1">特徴・傾向</p>
                            <p className="text-xs text-gray-600 dark:text-zinc-400 whitespace-pre-wrap">{baby.characteristics}</p>
                        </div>
                    )}
                </div>
                {isAdmin && (
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(baby)}
                            className="text-xs h-8 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                            aria-label={`${baby.name}の情報を編集`}
                        >
                            <Pencil className="h-3 w-3 mr-1" />
                            編集
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onDelete(baby)}
                            className="text-xs h-8 bg-red-500 hover:bg-red-600 text-white shadow-none"
                            aria-label={`${baby.name}の情報を削除`}
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            削除
                        </Button>
                    </div>
                )}
            </div>
        </SettingsCard>
    )
}
