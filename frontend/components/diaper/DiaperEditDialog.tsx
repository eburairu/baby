"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Diaper, DiaperType } from "@/types/diaper"
import { api } from "@/lib/api"
import { Textarea } from "@/components/ui/textarea"

interface Props {
    diaper: Diaper | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function DiaperEditDialog({ diaper, open, onOpenChange, onSuccess }: Props) {
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState<DiaperType>(DiaperType.WET)
    const [notes, setNotes] = useState("")

    useEffect(() => {
        if (diaper) {
            setType(diaper.diaper_type)
            setNotes(diaper.notes || "")
        }
    }, [diaper])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!diaper) return

        setLoading(true)
        try {
            await api.put(`/diapers/${diaper.id}`, {
                diaper_type: type,
                change_time: diaper.change_time,
                notes: notes
            })
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            alert("更新に失敗しました")
        } finally {
            setLoading(false)
        }
    }

    if (!diaper) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle data-sentry-unmask>記録の編集</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="dark:text-zinc-300" data-sentry-unmask>種類</Label>
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                type="button"
                                variant={type === DiaperType.WET ? "default" : "outline"}
                                className={type === DiaperType.WET 
                                    ? "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700" 
                                    : "dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"}
                                data-sentry-unmask onClick={() => setType(DiaperType.WET)}
                            >
                                💧 おしっこ
                            </Button>
                            <Button
                                type="button"
                                variant={type === DiaperType.DIRTY ? "default" : "outline"}
                                className={type === DiaperType.DIRTY 
                                    ? "bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700" 
                                    : "dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"}
                                data-sentry-unmask onClick={() => setType(DiaperType.DIRTY)}
                            >
                                💩 うんち
                            </Button>
                            <Button
                                type="button"
                                variant={type === DiaperType.BOTH ? "default" : "outline"}
                                className={type === DiaperType.BOTH 
                                    ? "bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700" 
                                    : "dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"}
                                data-sentry-unmask onClick={() => setType(DiaperType.BOTH)}
                            >
                                💧💩 両方
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="dark:text-zinc-300" data-sentry-unmask>日時</Label>
                        <div className="text-sm p-2 bg-gray-50 dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700 text-gray-600 dark:text-zinc-400">
                            {diaper.change_time ? new Date(diaper.change_time).toLocaleString("ja-JP", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="dark:text-zinc-300" data-sentry-unmask>メモ</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-sentry-unmask className="dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                            キャンセル
                        </Button>
                        <Button type="submit" disabled={loading} data-sentry-unmask className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-none">
                            {loading ? "保存中..." : "保存"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
