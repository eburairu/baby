"use client"
import { useState } from "react"
import { Copy, Check } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { api, isApiError } from "@/lib/api"
import { getDisplayName } from "@/lib/utils"
import { FamilyMember } from "@/types/family"

interface Props {
    member: FamilyMember | null
    open: boolean
    onClose: () => void
}

export function MemberPasswordResetDialog({ member, open, onClose }: Props) {
    const [step, setStep] = useState<"confirm" | "result">("confirm")
    const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)
    const [resetting, setResetting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const handleClose = () => {
        setStep("confirm")
        setTemporaryPassword(null)
        setError(null)
        setCopied(false)
        onClose()
    }

    const handleReset = async () => {
        if (!member) return
        setResetting(true)
        setError(null)
        try {
            const res = await api.post<{ temporary_password: string }>(
                `/family/members/${member.user_id}/reset-password`,
                {}
            )
            setTemporaryPassword(res.temporary_password)
            setStep("result")
        } catch (e: unknown) {
            if (isApiError(e)) {
                setError((e.info as { detail?: string })?.detail || "パスワード再発行に失敗しました")
            } else {
                setError("パスワード再発行に失敗しました")
            }
        } finally {
            setResetting(false)
        }
    }

    const handleCopy = () => {
        if (!temporaryPassword) return
        navigator.clipboard.writeText(temporaryPassword)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const displayName = member ? getDisplayName(member) : ""

    if (step === "result" && temporaryPassword) {
        return (
            <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>🔑 仮パスワードが発行されました</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-gray-600 dark:text-zinc-400">
                            <span className="font-medium">{displayName}</span> さんの仮パスワード:
                        </p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-4 py-3 rounded-lg font-mono text-sm tracking-widest select-all">
                                {temporaryPassword}
                            </code>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopy}
                                className="shrink-0 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                            >
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                            <p>⚠️ この画面を閉じると確認できなくなります。</p>
                            <p>本人に安全な方法で伝えてください。</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleClose} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            閉じる
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <AlertDialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{displayName} のパスワードを再発行しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                        現在のパスワードは無効になり、新しい仮パスワードが発行されます。
                        発行された仮パスワードを本人に伝えてください。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {error && <p className="text-red-500 text-sm px-1">{error}</p>}
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleClose}>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleReset}
                        disabled={resetting}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        再発行する
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
