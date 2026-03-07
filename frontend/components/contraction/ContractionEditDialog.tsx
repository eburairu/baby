"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ContractionRecord } from "@/types/contraction"
import { useCallback } from "react"

interface ContractionEditDialogProps {
    record: ContractionRecord | null
    isOpen: boolean
    onClose: () => void
    onUpdate: (data: FormData) => Promise<void>
    isUpdating: boolean
}

export function ContractionEditDialog({
    record,
    isOpen,
    onClose,
    onUpdate,
    isUpdating
}: ContractionEditDialogProps) {
    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        await onUpdate(new FormData(e.currentTarget))
    }, [onUpdate])

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>記録の編集</DialogTitle>
                        <DialogDescription>
                            陣痛の開始時刻や持続時間を修正します。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="start_time" className="text-right">開始時刻</Label>
                            <Input
                                id="start_time"
                                name="start_time"
                                type="time"
                                defaultValue={record ? new Date(record.start_time).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", hour12: false }) : ""}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="duration_seconds" className="text-right">持続(秒)</Label>
                            <Input
                                id="duration_seconds"
                                name="duration_seconds"
                                type="number"
                                defaultValue={record?.duration_seconds ?? 0}
                                className="col-span-3"
                                required
                                min="0"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notes" className="text-right">メモ</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                defaultValue={record?.notes ?? ""}
                                className="col-span-3"
                                placeholder="痛みの強さなど"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>キャンセル</Button>
                        <Button type="submit" loading={isUpdating}>
                            {isUpdating ? "保存中..." : "保存する"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
