"use client"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

interface Baby {
    id: number
    name: string
    birthday: string | null
    due_date: string | null
}

interface Props {
    baby: Baby
    isAdmin: boolean
    onEdit: (baby: Baby) => void
    onDelete: (baby: Baby) => void
}

function calcAge(birthday: string | null): string {
    if (!birthday) return ""
    const birth = new Date(birthday)
    const now = new Date()
    const diffMs = now.getTime() - birth.getTime()
    if (diffMs < 0) return ""
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const months = Math.floor(totalDays / 30.4375)
    const days = totalDays - Math.floor(months * 30.4375)
    if (months === 0) return `生後 ${days}日`
    if (days === 0) return `生後 ${months}ヶ月`
    return `生後 ${months}ヶ月 ${days}日`
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return ""
    return dateStr.replace(/-/g, "/")
}

export function BabyCard({ baby, isAdmin, onEdit, onDelete }: Props) {
    const age = calcAge(baby.birthday)

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-pink-500 font-semibold text-sm">👶 {baby.name}</span>
                    </div>
                    {age && <p className="text-sm text-gray-600">{age}</p>}
                    {baby.birthday && (
                        <p className="text-xs text-gray-500">誕生日: {formatDate(baby.birthday)}</p>
                    )}
                    {baby.due_date && (
                        <p className="text-xs text-gray-500">予定日: {formatDate(baby.due_date)}</p>
                    )}
                </div>
                {isAdmin && (
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(baby)}
                            className="text-xs h-8"
                        >
                            <Pencil className="h-3 w-3 mr-1" />
                            編集
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onDelete(baby)}
                            className="text-xs h-8 bg-red-500 hover:bg-red-600 text-white"
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            削除
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
