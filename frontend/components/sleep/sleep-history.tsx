"use client"

import { useState } from "react"
import { useSleeps } from "@/hooks/useData"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Trash2, Moon, Sun } from "lucide-react"
import { formatDuration } from "@/lib/ageUtils"

interface Props {
    babyId: string
}

export function SleepHistory({ babyId }: Props) {
    const { sleeps, mutate } = useSleeps(babyId)
    const [editingSleep, setEditingSleep] = useState<any>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    // Filter out records that are currently active (handled by SleepTimer)
    // or keep them but mark them. The spec says "SleepHistory" usually implies past records.
    // But displaying the active one might be confusing if it's also in the Timer.
    // Let's filter out active sleep (end_time is null) for history, or display them differently.
    // Usually history lists completed sleeps.
    const history = sleeps?.filter((s) => s.end_time).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())

    const handleDelete = async (id: number) => {
        if (!confirm("本当に削除しますか？")) return
        try {
            await api.delete(`/sleeps/${id}`)
            mutate()
        } catch (e) {
            console.error(e)
        }
    }

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingSleep) return
        try {
            await api.patch(`/sleeps/${editingSleep.id}`, {
                start_time: new Date(editingSleep.start_time).toISOString(),
                end_time: editingSleep.end_time ? new Date(editingSleep.end_time).toISOString() : null,
                notes: editingSleep.notes,
            })
            mutate()
            setIsEditOpen(false)
            setEditingSleep(null)
        } catch (e) {
            console.error(e)
        }
    }

    if (!history || history.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400">
                <p>記録はまだありません</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 px-1">最近の睡眠</h3>
            <div className="space-y-3">
                {history.map((sleep) => {
                    const duration = sleep.end_time
                        ? formatDuration(sleep.start_time, sleep.end_time)
                        : "睡眠中"

                    return (
                        <Card key={sleep.id} className="overflow-hidden border-0 shadow-sm bg-white hover:bg-slate-50 transition-colors">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 bg-indigo-100 p-2 rounded-full text-indigo-500">
                                        <Moon className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900">
                                                {format(new Date(sleep.start_time), "M/d HH:mm", { locale: ja })}
                                                <span className="text-gray-400 mx-2">-</span>
                                                {sleep.end_time ? format(new Date(sleep.end_time), "HH:mm", { locale: ja }) : "現在"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium text-xs">
                                                {duration}
                                            </span>
                                        </div>
                                        {sleep.notes && (
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                                {sleep.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-indigo-600"
                                        onClick={() => {
                                            setEditingSleep(sleep)
                                            setIsEditOpen(true)
                                        }}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                                        onClick={() => handleDelete(sleep.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>睡眠記録の編集</DialogTitle>
                    </DialogHeader>
                    {editingSleep && (
                        <form onSubmit={handleEditSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">開始日時</label>
                                    <Input
                                        type="datetime-local"
                                        value={format(new Date(editingSleep.start_time), "yyyy-MM-dd'T'HH:mm")}
                                        onChange={(e) => setEditingSleep({ ...editingSleep, start_time: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">終了日時</label>
                                    <Input
                                        type="datetime-local"
                                        value={editingSleep.end_time ? format(new Date(editingSleep.end_time), "yyyy-MM-dd'T'HH:mm") : ""}
                                        onChange={(e) => setEditingSleep({ ...editingSleep, end_time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">メモ</label>
                                <Textarea
                                    value={editingSleep.notes || ""}
                                    onChange={(e) => setEditingSleep({ ...editingSleep, notes: e.target.value })}
                                />
                            </div>
                            <Button type="submit" className="w-full">保存</Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
