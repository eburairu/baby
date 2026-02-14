"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DailySummary } from "@/types/dailySummary"

interface DiaryEditDialogProps {
    summary: DailySummary | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (summaryDate: string, editedContent: string | null) => Promise<void>
}

export function DiaryEditDialog({ summary, open, onOpenChange, onSave }: DiaryEditDialogProps) {
    const [content, setContent] = useState("")
    const [saving, setSaving] = useState(false)

    // ダイアログが開いたときに AI 生成文（または編集済み内容）を初期値としてセット
    useEffect(() => {
        if (open && summary) {
            setContent(summary.edited_content ?? summary.generated_content)
        }
    }, [open, summary])

    const handleOpenChange = (isOpen: boolean) => {
        onOpenChange(isOpen)
    }

    const handleSave = async () => {
        if (!summary) return
        setSaving(true)
        try {
            // 空欄の場合は null（リセット）
            await onSave(summary.summary_date, content.trim() || null)
            onOpenChange(false)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-base">育児日誌を編集</DialogTitle>
                </DialogHeader>
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    className="resize-none rounded-xl text-sm"
                    placeholder="育児日誌の内容を入力..."
                />
                <p className="text-xs text-gray-400">空欄で保存すると AI 生成文に戻ります。</p>
                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={saving}
                        className="rounded-xl"
                    >
                        キャンセル
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-xl"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                        保存
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
