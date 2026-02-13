"use client"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"

interface Baby {
    id: number
    name: string
}

interface Props {
    baby: Baby | null
    open: boolean
    onClose: () => void
    onDeleted: () => void
}

export function BabyDeleteDialog({ baby, open, onClose, onDeleted }: Props) {
    const [confirmName, setConfirmName] = useState("")
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleClose = () => {
        setConfirmName("")
        setError(null)
        onClose()
    }

    const handleDelete = async () => {
        if (!baby) return
        setDeleting(true)
        setError(null)
        try {
            await api.delete(`/babies/${baby.id}`)
            setConfirmName("")
            onDeleted()
            onClose()
        } catch {
            setError("削除に失敗しました")
        } finally {
            setDeleting(false)
        }
    }

    const canDelete = confirmName === baby?.name

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>⚠️ 赤ちゃんを削除しますか？</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                    <p className="text-sm text-gray-700">
                        「{baby?.name}」に関するすべての記録（授乳・睡眠・おむつ・成長など）も削除されます。この操作は取り消せません。
                    </p>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">
                            確認のため赤ちゃんの名前を入力してください:
                        </p>
                        <Input
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            placeholder={baby?.name}
                            autoFocus
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={deleting}>
                        キャンセル
                    </Button>
                    <Button
                        onClick={handleDelete}
                        disabled={!canDelete || deleting}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        削除
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
