"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ShieldCheck } from "lucide-react"
import { calcAge } from "@/lib/ageUtils"
import { BabyPermissionDialog } from "./BabyPermissionDialog"

import { Baby } from "@/types/baby"

/* Removed local Baby interface */

interface Props {
    baby: Baby
    isAdmin: boolean
    hasMemberUsers: boolean
    onEdit: (baby: Baby) => void
    onDelete: (baby: Baby) => void
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return ""
    return dateStr.replace(/-/g, "/")
}

export function BabyCard({ baby, isAdmin, hasMemberUsers, onEdit, onDelete }: Props) {
    const age = baby.birthday ? calcAge(baby.birthday).label : ""
    const [permissionDialogOpen, setPermissionDialogOpen] = useState(false)

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-4 transition-colors">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-pink-500 dark:text-pink-400 font-semibold text-sm">👶 {baby.name}</span>
                    </div>
                    {age && <p className="text-sm text-gray-600 dark:text-zinc-400">{age}</p>}
                    {baby.birthday && (
                        <p className="text-xs text-gray-500 dark:text-zinc-500">誕生日: {formatDate(baby.birthday)}</p>
                    )}
                    {baby.due_date && (
                        <p className="text-xs text-gray-500 dark:text-zinc-500">予定日: {formatDate(baby.due_date)}</p>
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
                            variant="outline"
                            size="sm"
                            onClick={() => setPermissionDialogOpen(true)}
                            disabled={!hasMemberUsers}
                            className="text-xs h-8 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-900 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                        >
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            権限
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(baby)}
                            className="text-xs h-8 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                        >
                            <Pencil className="h-3 w-3 mr-1" />
                            編集
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onDelete(baby)}
                            className="text-xs h-8 bg-red-500 hover:bg-red-600 text-white shadow-none"
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            削除
                        </Button>
                    </div>
                )}
            </div>

            <BabyPermissionDialog
                baby={baby}
                open={permissionDialogOpen}
                onOpenChange={setPermissionDialogOpen}
            />
        </div>
    )
}
