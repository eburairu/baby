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
    const [changeTime, setChangeTime] = useState("")
    const [notes, setNotes] = useState("")

    useEffect(() => {
        if (diaper) {
            setType(diaper.diaper_type)
            // Convert ISO string to datetime-local format (yyyy-MM-ddThh:mm)
            // Note: This simple slice works for ISO strings that end in Z or offset, 
            // but for inputs we need local time. 
            // Better to parse date and format it.
            const date = new Date(diaper.change_time)
            // Adjust to local time string for input
            const localIso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
            setChangeTime(localIso)
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
                change_time: new Date(changeTime).toISOString(),
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
                    <DialogTitle>記録の編集</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>種類</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={type === DiaperType.WET ? "default" : "outline"}
                                className={type === DiaperType.WET ? "bg-blue-500 hover:bg-blue-600" : ""}
                                onClick={() => setType(DiaperType.WET)}
                            >
                                💧 おしっこ
                            </Button>
                            <Button
                                type="button"
                                variant={type === DiaperType.DIRTY ? "default" : "outline"}
                                className={type === DiaperType.DIRTY ? "bg-amber-500 hover:bg-amber-600" : ""}
                                onClick={() => setType(DiaperType.DIRTY)}
                            >
                                💩 うんち
                            </Button>
                            <Button
                                type="button"
                                variant={type === DiaperType.BOTH ? "default" : "outline"}
                                className={type === DiaperType.BOTH ? "bg-purple-500 hover:bg-purple-600" : ""}
                                onClick={() => setType(DiaperType.BOTH)}
                            >
                                💧💩 両方
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="time">日時</Label>
                        <Input
                            id="time"
                            type="datetime-local"
                            value={changeTime}
                            onChange={(e) => setChangeTime(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">メモ</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            キャンセル
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "保存中..." : "保存"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
