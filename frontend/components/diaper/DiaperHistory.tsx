"use client"
import { Diaper, DiaperType } from "@/types/diaper"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Minimal date formatter if date-fns is missing, or use Intl.DateTimeFormat
const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('ja-JP', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

interface Props {
    diapers: Diaper[]
    onDeleteSuccess: () => void
}

export function DiaperHistory({ diapers, onDeleteSuccess }: Props) {

    const handleDelete = async (id: number) => {
        if (!confirm("この記録を削除しますか？")) return
        try {
            await api.delete(`/diapers/${id}`)
            onDeleteSuccess()
        } catch (e) {
            console.error(e)
            alert("削除に失敗しました")
        }
    }

    const getStyles = (type: DiaperType) => {
        switch (type) {
            case DiaperType.WET:
                return {
                    bg: "bg-blue-50",
                    border: "border-blue-100",
                    text: "text-blue-700",
                    icon: "💧",
                    label: "おしっこ"
                }
            case DiaperType.DIRTY:
                return {
                    bg: "bg-amber-50",
                    border: "border-amber-100",
                    text: "text-amber-700",
                    icon: "💩",
                    label: "うんち"
                }
            case DiaperType.BOTH:
                return {
                    bg: "bg-purple-50",
                    border: "border-purple-100",
                    text: "text-purple-700",
                    icon: "💧💩",
                    label: "両方"
                }
            default:
                return {
                    bg: "bg-gray-50",
                    border: "border-gray-100",
                    text: "text-gray-700",
                    icon: "?",
                    label: "不明"
                }
        }
    }

    return (
        <Card className="bg-white rounded-2xl shadow-sm border-0">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">最近の記録</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {diapers.length === 0 && <p className="text-sm text-gray-400 text-center py-4">記録がありません</p>}

                {diapers.map((diaper) => {
                    const style = getStyles(diaper.diaper_type)
                    return (
                        <div
                            key={diaper.id}
                            className={`flex items-center justify-between p-3 rounded-xl border ${style.bg} ${style.border}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{style.icon}</span>
                                <div>
                                    <div className={`text-sm font-bold ${style.text}`}>
                                        {style.label}
                                        <span className="text-xs font-normal text-gray-500 ml-2">
                                            {formatDate(diaper.change_time)}
                                        </span>
                                    </div>
                                    {diaper.notes && (
                                        <div className="text-xs text-gray-600 mt-0.5">{diaper.notes}</div>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-transparent"
                                onClick={() => handleDelete(diaper.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
